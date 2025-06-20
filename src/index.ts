#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { Client, GatewayIntentBits, TextChannel, Message } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DEFAULT_TIMEOUT = parseInt(process.env.DEFAULT_TIMEOUT || '60');

if (!BOT_TOKEN) {
  console.error('Error: DISCORD_BOT_TOKEN is required');
  process.exit(1);
}

// Initialize Discord client
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Store pending requests
const pendingRequests = new Map<string, (value: string) => void>();
// Discord event handlers
discord.on('ready', () => {
  console.error(`Discord bot connected as ${discord.user?.tag}`);
});

discord.on('messageCreate', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if this is a reply to a pending request
  if (!message.reference?.messageId) return;
  
  const resolver = pendingRequests.get(message.reference.messageId);
  if (!resolver) return;
  
  // Resolve the pending request
  resolver(message.content);
  pendingRequests.delete(message.reference.messageId);
  
  // Add reaction to confirm receipt
  try {
    await message.react('✅');
  } catch (error) {
    console.error('Failed to add reaction:', error);
  }
});
// Helper function to get channel
async function getChannel(channelId?: string): Promise<TextChannel> {
  const id = channelId || DEFAULT_CHANNEL_ID;
  if (!id) {
    throw new Error('No channel ID provided and no default channel configured');
  }
  
  const channel = await discord.channels.fetch(id);
  if (!channel || !channel.isTextBased()) {
    throw new Error(`Channel ${id} not found or is not a text channel`);
  }
  
  return channel as TextChannel;
}

// Initialize MCP server
const server = new Server(
  {
    name: 'discord-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
// Register tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === 'discord_send_notification') {
      const { message, channel_id } = args as any;
      
      const channel = await getChannel(channel_id);
      await channel.send(message);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, message: 'Notification sent' }),
          },
        ],
      };
    }
    
    if (name === 'discord_request_input') {
      const { question, timeout_seconds, channel_id } = args as any;
      const timeout = (timeout_seconds || DEFAULT_TIMEOUT) * 1000;
      
      const channel = await getChannel(channel_id);
      const message = await channel.send(
        `📋 **${question}**\n*Reply to this message to respond*`
      );
      
      // Wait for response
      const response = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          pendingRequests.delete(message.id);
          message.edit(message.content + '\n\n❌ **Timed out**').catch(() => {});
          reject(new Error('Timeout'));
        }, timeout);
        
        pendingRequests.set(message.id, (value: string) => {
          clearTimeout(timer);
          resolve(value);
        });
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, response }),
          },
        ],
      };
    }
    if (name === 'discord_yes_no') {
      const { question, timeout_seconds, channel_id } = args as any;
      const timeout = (timeout_seconds || DEFAULT_TIMEOUT) * 1000;
      
      const channel = await getChannel(channel_id);
      const message = await channel.send(`❓ **${question}**`);
      
      // Add reactions
      await message.react('✅');
      await message.react('❌');
      
      // Wait for reaction
      const collected = await message.awaitReactions({
        filter: (reaction, user) => 
          !user.bot && ['✅', '❌'].includes(reaction.emoji.name || ''),
        max: 1,
        time: timeout,
      });
      
      if (collected.size === 0) {
        await message.edit(message.content + '\n\n❌ **Timed out**');
        throw new Error('Timeout');
      }
      
      const reaction = collected.first()!;
      const result = reaction.emoji.name === '✅';
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, result }),
          },
        ],
      };
    }
    
    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    const errorMessage = error?.message === 'Timeout' 
      ? 'No response received within timeout' 
      : error?.message || 'Unknown error';
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: errorMessage }),
        },
      ],
    };
  }
});
// Tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'discord_send_notification',
        description: 'Send a notification message to a Discord channel',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to send',
            },
            channel_id: {
              type: 'string',
              description: 'Discord channel ID (optional, uses default if not provided)',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'discord_request_input',
        description: 'Send a message and wait for a user response',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The question to ask',
            },
            timeout_seconds: {
              type: 'number',
              description: 'Timeout in seconds (default: 60)',
            },
            channel_id: {
              type: 'string',
              description: 'Discord channel ID (optional)',
            },
          },
          required: ['question'],
        },
      },
      {
        name: 'discord_yes_no',
        description: 'Ask a yes/no question with reaction-based responses',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The yes/no question to ask',
            },
            timeout_seconds: {
              type: 'number',
              description: 'Timeout in seconds (default: 60)',
            },
            channel_id: {
              type: 'string',
              description: 'Discord channel ID (optional)',
            },
          },
          required: ['question'],
        },
      },
    ],
  };
});

// Start the server
async function main() {
  // Connect to Discord
  await discord.login(BOT_TOKEN);
  
  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Discord MCP Server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

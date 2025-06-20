import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Please set DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

async function test() {
  await client.login(BOT_TOKEN);
  console.log('Bot connected!');
  
  const channel = await client.channels.fetch(CHANNEL_ID!);  // We know it exists from check above
  if (!channel?.isTextBased()) {
    console.error('Invalid channel');
    process.exit(1);
  }
  
  const textChannel = channel as TextChannel;
  const testType = process.argv[2] || 'all';
  
  if (testType === 'notify' || testType === 'all') {
    console.log('\n📢 Testing notification...');
    await textChannel.send('Test notification from MCP server! 🎉');
    console.log('✅ Notification sent');
  }
  if (testType === 'input' || testType === 'all') {
    console.log('\n💬 Testing user input (you have 30 seconds to reply)...');
    const msg = await textChannel.send('**Test Question**\nWhat is your favorite color?\n*Reply to this message*');
    
    try {
      const collected = await textChannel.awaitMessages({
        filter: (m) => m.reference?.messageId === msg.id,
        max: 1,
        time: 30000,
      });
      
      const response = collected.first();
      console.log(`✅ Got response: ${response?.content}`);
    } catch {
      console.log('❌ No response received');
    }
  }
  
  if (testType === 'yesno' || testType === 'all') {
    console.log('\n✅❌ Testing yes/no (click a reaction within 30 seconds)...');
    const msg = await textChannel.send('**Test Question**\nDo you like pizza?');
    await msg.react('✅');
    await msg.react('❌');
    
    try {
      const collected = await msg.awaitReactions({
        filter: (r, u) => !u.bot && ['✅', '❌'].includes(r.emoji.name || ''),
        max: 1,
        time: 30000,
      });
      
      const reaction = collected.first();
      console.log(`✅ Got response: ${reaction?.emoji.name === '✅' ? 'Yes' : 'No'}`);
    } catch {
      console.log('❌ No response received');
    }
  }
  
  console.log('\n✨ Test complete!');
  process.exit(0);
}

test().catch(console.error);

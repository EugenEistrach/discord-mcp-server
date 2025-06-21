# MCP Discord Agent Communication

An MCP (Model Context Protocol) server that enables async communication between AI agents and users via Discord. Perfect for long-running AI tasks where you need remote interaction capabilities.

## 🎯 Purpose

This isn't a full Discord bot - it's specifically designed for **AI agents to communicate with users remotely** during long-running tasks. Step away from your machine while your AI assistant handles complex work and reaches out when needed.

## Features

- 📢 **Send Notifications** - Agent sends updates to Discord channels
- 💬 **Request User Input** - Agent asks questions and waits for responses
- ✅ **Yes/No Questions** - Simple decision prompts with emoji reactions
- ⏰ **Async Communication** - Perfect for long-running tasks requiring remote interaction

## Use Cases

Perfect for scenarios where AI agents need remote human interaction:
- Kick off complex tasks and get notified when they complete
- Let AI ask for your input or feedback when decisions are needed
- Stay in the loop while doing other activities (workouts, walks, meetings)
- Monitor progress without being glued to your screen

## Quick Setup

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create "New Application" → Go to "Bot" → "Add Bot"
3. Copy the bot token
4. Enable "MESSAGE CONTENT INTENT" in bot settings
5. Use OAuth2 URL Generator to invite bot to your server with these permissions:
   - Send Messages, Read Message History, Add Reactions, View Channels

### 2. Get Channel ID

Enable Developer Mode in Discord settings, then right-click your channel → "Copy Channel ID"

### 3. Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "discord-agent-comm": {
      "command": "npx",
      "args": ["mcp-discord-agent-comm"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-bot-token-here",
        "DISCORD_CHANNEL_ID": "your-channel-id-here"
      }
    }
  }
}
```

## Available Tools

### `discord_send_notification`
```json
{
  "message": "Task completed! 🎉"
}
```

### `discord_request_input`
```json
{
  "question": "What should I name this file?",
  "timeout_seconds": 300
}
```

### `discord_yes_no`
```json
{
  "question": "Deploy to production?",
  "timeout_seconds": 300
}
```

## Agent Instructions

For guidance on how to instruct AI agents to use these tools effectively, see [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md). It provides example guidelines for when agents should communicate vs. work autonomously.

## Important Notes

### Discord Notifications
- **Only one device receives Discord notifications** - disable Discord on other devices or turn off notifications if you want them on a specific device
- Notifications work best on mobile devices when other instances are closed

### How It Works
- **Notifications**: Direct message to channel
- **Input requests**: Users reply to the bot's message using Discord's reply feature
- **Yes/No**: Users click ✅ or ❌ reactions
- **Default timeout**: 300 seconds (5 minutes)

## Troubleshooting

- **Bot offline**: Check token and permissions
- **No notifications**: Ensure MESSAGE CONTENT INTENT enabled, check channel permissions
- **Timeouts**: Users must reply to messages (not just type in channel) or click reactions

## Development

```bash
git clone https://github.com/EugenEistrach/mcp-discord-agent-comm.git
cd mcp-discord-agent-comm
bun install
cp .env.example .env  # Edit with your tokens
bun run dev
```

## License

MIT

## Publishing Status

[![npm version](https://badge.fury.io/js/mcp-discord-agent-comm.svg)](https://badge.fury.io/js/mcp-discord-agent-comm)
[![Downloads](https://img.shields.io/npm/dm/mcp-discord-agent-comm.svg)](https://www.npmjs.com/package/mcp-discord-agent-comm)

Install globally: `npm install -g mcp-discord-agent-comm`

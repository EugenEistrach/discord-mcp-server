# Discord MCP Server

A simple Model Context Protocol (MCP) server that enables AI assistants to send notifications and request user input through Discord.

## Features

- 📢 **Send Notifications** - Send messages to Discord channels
- 💬 **Request User Input** - Ask questions and wait for responses with timeout
- ✅ **Yes/No Questions** - Simple decision prompts with reaction-based responses
- ⏱️ **Configurable Timeouts** - Set how long to wait for user responses
- 🔄 **Simple Integration** - Works with any MCP-compatible client (Claude Desktop, VSCode, etc.)

## Prerequisites

- Node.js 18+ 
- A Discord account
- A Discord server where you have permission to add bots

## Installation

```bash
npm install discord-mcp-server
```

Or install globally:

```bash
npm install -g discord-mcp-server
```

## Discord Bot Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot"

### 2. Get Your Bot Token

1. In the Bot section, click "Reset Token"
2. Copy the token (you'll need this for configuration)
3. **Keep this token secret!** Never commit it to Git

### 3. Set Bot Permissions

1. In the Bot section, scroll down to "Privileged Gateway Intents"
2. Enable "MESSAGE CONTENT INTENT"

### 4. Invite Bot to Your Server

1. Go to "OAuth2" → "URL Generator" in the left sidebar
2. Select these scopes:
   - `bot`
3. Select these bot permissions:
   - Send Messages
   - Read Message History  
   - Add Reactions
   - View Channels
4. Copy the generated URL and open it in your browser
5. Select your server and click "Authorize"

### 5. Get Your Channel ID

1. In Discord, go to User Settings → Advanced
2. Enable "Developer Mode"
3. Right-click on the channel where you want the bot to send messages
4. Click "Copy Channel ID"

## Configuration

### For Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["discord-mcp-server"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-bot-token-here",
        "DISCORD_CHANNEL_ID": "your-channel-id-here"
      }
    }
  }
}
```

### Environment Variables

You can also use a `.env` file in your project:

```env
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_CHANNEL_ID=your-channel-id-here
```

## Usage

Once configured, the following tools are available in your MCP client:

### Send a Notification

```typescript
await discord_send_notification({
  message: "Task completed successfully! 🎉"
});
```

### Ask for User Input

```typescript
const response = await discord_request_input({
  question: "What should I name this file?",
  timeout_seconds: 60  // Optional, defaults to 60
});

// Response: { success: true, response: "user_data.json" }
```

### Ask a Yes/No Question

```typescript
const answer = await discord_yes_no({
  question: "Should I deploy to production?",
  timeout_seconds: 30  // Optional, defaults to 60
});

// Response: { success: true, result: true }
```

## How It Works

1. **Notifications**: Simply sends a message to the configured Discord channel
2. **User Input**: 
   - Bot sends a message asking for input
   - Users click "Reply" on the message and type their response
   - Bot waits for the reply (up to timeout)
   - Returns the user's response or times out
3. **Yes/No Questions**:
   - Bot sends a message with ✅ and ❌ reactions
   - User clicks one of the reactions
   - Bot returns true for ✅, false for ❌

## Development

### Running Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/discord-mcp-server.git
cd discord-mcp-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your bot token and channel ID

# Run in development mode
npm run dev
```

### Building

```bash
npm run build
```

### Testing

```bash
# Run the test script
npm test

# Or test individual functions
npm run test:notify
npm run test:input
npm run test:yesno
```

## Troubleshooting

### Bot is not responding
- Check that the bot is online in your Discord server (should show as online in member list)
- Verify the bot has permissions in the channel
- Check the channel ID is correct
- Ensure MESSAGE CONTENT INTENT is enabled in Discord Developer Portal

### Timeout errors
- The default timeout is 60 seconds
- Users must reply to the specific message (using Discord's reply feature)
- For yes/no questions, users must click the reaction, not type a response

### Permission errors
- Ensure the bot has all required permissions in the channel
- The bot needs to be able to see the channel, send messages, and add reactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Security

- Never share your bot token
- Use environment variables for sensitive configuration
- Don't commit `.env` files to version control

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/yourusername/discord-mcp-server)
- Check existing issues for solutions

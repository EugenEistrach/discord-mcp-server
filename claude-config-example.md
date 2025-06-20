# Claude Desktop Configuration Example

Add this to your Claude Desktop configuration file:

## macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

## Windows
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/Users/eugeneistrach/projects/personal/discord-mcp-server/dist/index.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_CHANNEL_ID": "YOUR_CHANNEL_ID_HERE"
      }
    }
  }
}
```

Note: You'll need to build the project first:
```bash
npm run build
```

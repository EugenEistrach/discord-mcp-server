# Claude Desktop Configuration Example

Add this to your Claude Desktop configuration file:

## macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

## Windows
`%APPDATA%\Claude\claude_desktop_config.json`

## For Published Package (Recommended)

```json
{
  "mcpServers": {
    "discord-agent-comm": {
      "command": "npx",
      "args": ["mcp-discord-agent-comm"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_CHANNEL_ID": "YOUR_CHANNEL_ID_HERE",
        "DEFAULT_TIMEOUT": "60"
      }
    }
  }
}
```

## For Local Development

```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/discord-mcp-server/dist/index.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_CHANNEL_ID": "YOUR_CHANNEL_ID_HERE",
        "DEFAULT_TIMEOUT": "60"
      }
    }
  }
}
```

Note: For local development, you'll need to build the project first:
```bash
bun run build
```

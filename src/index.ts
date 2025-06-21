#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client, GatewayIntentBits, type Message } from "discord.js";
import dotenv from "dotenv";
import { requestInputTool } from "./tools/request-input.js";
import { sendNotificationTool } from "./tools/send-notification.js";
import { yesNoTool } from "./tools/yes-no.js";

// Load environment variables
dotenv.config();

// Validate environment variables
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DEFAULT_TIMEOUT = Number.parseInt(process.env.DEFAULT_TIMEOUT || "300");

if (!BOT_TOKEN) {
	console.error("Error: DISCORD_BOT_TOKEN is required");
	process.exit(1);
}

// Initialize Discord client
const discord = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
	],
});

// Store pending requests
const pendingRequests = new Map<string, (value: string) => void>();

// Discord event handlers
discord.on("ready", () => {
	console.error(`Discord bot connected as ${discord.user?.tag}`);
});

discord.on("messageCreate", async (message: Message) => {
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
		await message.react("✅");
	} catch (error) {
		console.error("Failed to add reaction:", error);
	}
});

// Initialize MCP server
const server = new McpServer(
	{
		name: "discord-mcp-server",
		version: "0.1.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

// Register tools
sendNotificationTool(server, discord, DEFAULT_CHANNEL_ID);
requestInputTool(
	server,
	discord,
	DEFAULT_CHANNEL_ID,
	DEFAULT_TIMEOUT,
	pendingRequests,
);
yesNoTool(server, discord, DEFAULT_CHANNEL_ID, DEFAULT_TIMEOUT);

// Start the server
async function main() {
	// Connect to Discord
	await discord.login(BOT_TOKEN);

	// Start MCP server
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("Discord MCP Server running");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});

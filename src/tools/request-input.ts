import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "discord.js";
import { z } from "zod";
import { getChannel } from "../utils.js";

export function requestInputTool(
	server: McpServer,
	discord: Client,
	defaultChannelId: string | undefined,
	defaultTimeout: number,
	pendingRequests: Map<string, (value: string) => void>,
) {
	server.tool(
		"discord_request_input",
		"Send a message and wait for a user response",
		{
			question: z.string().describe("The question to ask"),
			timeout_seconds: z
				.number()
				.optional()
				.describe("Timeout in seconds (default: 60)"),
			channel_id: z
				.string()
				.optional()
				.describe("Discord channel ID (optional)"),
		},
		async ({ question, timeout_seconds, channel_id }) => {
			const timeout = (timeout_seconds || defaultTimeout) * 1000;
			const channel = await getChannel(discord, channel_id, defaultChannelId);
			const message = await channel.send(
				`📋 **${question}**\n*Reply to this message to respond*`,
			);

			// Wait for response
			const response = await new Promise<string>((resolve, reject) => {
				const timer = setTimeout(() => {
					pendingRequests.delete(message.id);
					message
						.edit(`${message.content}\n\n❌ **Timed out**`)
						.catch(() => {});
					reject(new Error("Timeout"));
				}, timeout);

				pendingRequests.set(message.id, (value: string) => {
					clearTimeout(timer);
					resolve(value);
				});
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ success: true, response }),
					},
				],
			};
		},
	);
}

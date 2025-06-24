import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "discord.js";
import { z } from "zod";
import { getChannel } from "../utils.js";

export function discordMessageTool(
	server: McpServer,
	discord: Client,
	defaultChannelId: string | undefined,
	defaultTimeout: number,
	pendingRequests: Map<string, (value: string) => void>,
) {
	server.tool(
		"discord_message",
		"Send a message to Discord, optionally waiting for a response",
		{
			message: z.string().describe("The message to send"),
			expect_reply: z
				.boolean()
				.optional()
				.default(false)
				.describe("Whether to wait for a user response"),
			channel_id: z
				.string()
				.optional()
				.describe("Discord channel ID (uses default if not provided)"),
		},
		async ({ message, expect_reply, channel_id }) => {
			const channel = await getChannel(discord, channel_id, defaultChannelId);

			if (!expect_reply) {
				// Simple notification - just send and return
				await channel.send(message);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								success: true,
								message: "Message sent",
							}),
						},
					],
				};
			}

			// Send message and wait for reply
			const sentMessage = await channel.send(
				`📋 **${message}**\n*Reply to this message to respond*`,
			);

			// Wait for response
			const response = await new Promise<string>((resolve, reject) => {
				const timer = setTimeout(() => {
					pendingRequests.delete(sentMessage.id);
					sentMessage
						.edit(`${sentMessage.content}\n\n❌ **Timed out**`)
						.catch(() => {});
					reject(new Error("Timeout waiting for response"));
				}, defaultTimeout * 1000);

				pendingRequests.set(sentMessage.id, (value: string) => {
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

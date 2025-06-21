import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "discord.js";
import { z } from "zod";
import { getChannel } from "../utils.js";

export function sendNotificationTool(
	server: McpServer,
	discord: Client,
	defaultChannelId?: string,
) {
	server.tool(
		"discord_send_notification",
		"Send a notification message to a Discord channel",
		{
			message: z.string().describe("The message to send"),
			channel_id: z
				.string()
				.optional()
				.describe(
					"Discord channel ID (optional, uses default if not provided)",
				),
		},
		async ({ message, channel_id }) => {
			const channel = await getChannel(discord, channel_id, defaultChannelId);
			await channel.send(message);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({
							success: true,
							message: "Notification sent",
						}),
					},
				],
			};
		},
	);
}

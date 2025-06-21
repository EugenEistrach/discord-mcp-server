import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "discord.js";
import { z } from "zod";
import { getChannel } from "../utils.js";

export function yesNoTool(
	server: McpServer,
	discord: Client,
	defaultChannelId: string | undefined,
	defaultTimeout: number,
) {
	server.tool(
		"discord_yes_no",
		"Ask a yes/no question with reaction-based responses",
		{
			question: z.string().describe("The yes/no question to ask"),
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
			const message = await channel.send(`❓ **${question}**`);

			// Add reactions
			await message.react("✅");
			await message.react("❌");

			// Wait for reaction
			const collected = await message.awaitReactions({
				filter: (reaction, user) =>
					!user.bot && ["✅", "❌"].includes(reaction.emoji.name || ""),
				max: 1,
				time: timeout,
			});

			if (collected.size === 0) {
				await message.edit(`${message.content}\n\n❌ **Timed out**`);
				throw new Error("Timeout");
			}

			const reaction = collected.first();
			if (!reaction) {
				throw new Error("No reaction found");
			}
			const result = reaction.emoji.name === "✅";

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ success: true, result }),
					},
				],
			};
		},
	);
}

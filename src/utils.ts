import type { Client, TextChannel } from "discord.js";

export async function getChannel(
	discord: Client,
	channelId?: string,
	defaultChannelId?: string,
): Promise<TextChannel> {
	const id = channelId || defaultChannelId;
	if (!id) {
		throw new Error("No channel ID provided and no default channel configured");
	}

	const channel = await discord.channels.fetch(id);
	if (!channel || !channel.isTextBased()) {
		throw new Error(`Channel ${id} not found or is not a text channel`);
	}

	return channel as TextChannel;
}

export function createSuccessResponse(data: Record<string, unknown>) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify({ success: true, ...data }),
			},
		],
	};
}

export function createErrorResponse(error: unknown) {
	const errorMessage =
		(error as Error)?.message === "Timeout"
			? "No response received within timeout"
			: (error as Error)?.message || "Unknown error";

	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify({ success: false, error: errorMessage }),
			},
		],
	};
}

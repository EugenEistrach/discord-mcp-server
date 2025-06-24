import type { TextChannel } from "discord.js";

export interface ToolContext {
	getChannel: (channelId?: string) => Promise<TextChannel>;
	pendingRequests: Map<string, (value: string) => void>;
	defaultTimeout: number;
}

export interface ToolResult {
	content: Array<{
		type: "text";
		text: string;
	}>;
	isError?: boolean;
}

export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, unknown>;
		required: string[];
	};
}

export interface DiscordMessageArgs {
	message: string;
	expect_reply?: boolean;
	channel_id?: string;
}

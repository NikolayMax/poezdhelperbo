import { CallbackQueryContext, Context, SessionFlavor } from 'grammy';

export interface SessionData {
	messageIds: number[];
}
export type BotContext = Context & SessionFlavor<SessionData>;
export type ActionContext = CallbackQueryContext<BotContext>;

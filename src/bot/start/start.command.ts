import { Command } from '../../decorator';
import { START } from './consts';
import { StartAction } from './start.action';
import { BotContext } from '../../types';

export class StartCommand {
	constructor(private readonly startAction: StartAction) {}

	@Command(START)
	async command(ctx: BotContext) {
		const { text, reply_markup } = this.startAction.buttons();
		const message = await ctx.reply(text, { reply_markup });
		await ctx.deleteMessage();
		ctx.session.messageIds.push(message.message_id);
	}
}

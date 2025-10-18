import { Context } from 'grammy';
import { Command } from '../../decorator/command.decorator';
import { START } from './consts';
import { StartAction } from './start.action';

export class StartCommand {
	constructor(private readonly startAction: StartAction) {}

	@Command(START)
	async command(ctx: Context) {
		const { text, reply_markup } = this.startAction.buttons();
		await ctx.reply(text, { reply_markup });
	}
}

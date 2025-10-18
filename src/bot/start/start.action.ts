import { InlineKeyboard } from 'grammy';
import { START } from './consts';
import { Action } from '../../decorator/action.decorator';
import { WATCH_ACTION } from '../watch/contst';
import { ActionContext } from '../../types/bot.interface';

export class StartAction {
	@Action(START)
	async action(ctx: ActionContext) {
		const { text, reply_markup } = this.buttons();
		await ctx.reply(text, { reply_markup });
	}

	buttons() {
		const inlineKeyboard = new InlineKeyboard()
			.text('🎯 Начать поиск мест', WATCH_ACTION)
			.row()
			.text('❓ Помощь и поддержка', '/help');
		return {
			text: `
Привет! 👋 Я знаю всё о свободных местах в электричках! 🚊
Готов найти тебе идеальное место? Поехали! 💥
			`.trim(),
			reply_markup: inlineKeyboard,
		};
	}
}

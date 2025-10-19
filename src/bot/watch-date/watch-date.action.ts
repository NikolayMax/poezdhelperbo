import { InlineKeyboard } from 'grammy';
import { UserRedis } from '../../services';
import { MonthNameRus, WATCH_DATE } from './consts';
import { Action } from '../../decorator';
import { ActionContext } from '../../types';

export class WatchDateAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(WATCH_DATE)
	async action(ctx: ActionContext) {
		const { text, reply_markup } = await this.buttons(ctx);
		await ctx.reply(text, { reply_markup });
	}

	async buttons(ctx: ActionContext) {
		const userId = ctx.from.id;
		const { selectedMonth } = await this.userRedis.getData(userId);
		const inlineKeyboard = new InlineKeyboard();

		for (let i: number = selectedMonth ? selectedMonth : 0; i < 12; i++) {
			if (typeof MonthNameRus[i] === 'string') {
				inlineKeyboard.text(MonthNameRus[i] as string, `month:${i}`).row();
			}
		}
		return {
			text: 'Выберите месяц: ',
			reply_markup: inlineKeyboard,
		};
	}
}

import { InlineKeyboard } from 'grammy';
import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { MONTH_ACTION } from './consts';
import { ActionContext } from '../../types';

export class MonthAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(new RegExp(MONTH_ACTION))
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		userData.selectedMonth = Number((ctx.match as string[])[1]);
		await this.userRedis.setData(userId, userData);

		const { text, reply_markup } = await this.buttons(ctx);

		const message = await ctx.reply(text, { reply_markup });
        ctx.session.messageIds.push(message.message_id);
	}
	async buttons(ctx: ActionContext) {
		const now = new Date();

		const currentMonth = now.getMonth();
		const currentDay = now.getDate();
		const userId = ctx.from.id;
		const { selectedYear, selectedMonth } = await this.userRedis.getData(userId);
		const endDay = this.getLastDayOfMonth(selectedYear, selectedMonth);

		const inlineKeyboard = new InlineKeyboard();
		for (let i = currentMonth === selectedMonth ? currentDay : 1; i <= endDay; i++) {
			inlineKeyboard.text(`${i}`, `day:${i}`);
		}

		return {
			text: 'Выберите день: ',
			reply_markup: inlineKeyboard,
		};
	}

	getLastDayOfMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}
}

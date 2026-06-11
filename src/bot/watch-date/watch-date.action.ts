import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { WATCH_DATE } from './consts';
import { ActionContext } from '../../types';
import { renderCalendar } from '../calendar/calendar.action';

export class WatchDateAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(WATCH_DATE)
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);

		if (userData.selectedYear === undefined || userData.selectedMonth === undefined) {
			const now = new Date();
			userData.selectedYear = now.getFullYear();
			userData.selectedMonth = now.getMonth();
		}
		await this.userRedis.setData(userId, userData);

		const keyboard = renderCalendar(userData.selectedYear, userData.selectedMonth);
		const message = await ctx.reply('📅 Выберите дату:', { reply_markup: keyboard });
		ctx.session.messageIds.push(message.message_id);
	}
}

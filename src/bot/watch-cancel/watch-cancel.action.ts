import { WATCH_CANCEL } from './consts';
import { ActionContext } from '../../types';
import { ScheduleService } from '../../services';
import { UserRedis } from '../../services';
import { Action } from '../../decorator';

export class WatchCancelAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly scheduleService: ScheduleService,
	) {}
	@Action(new RegExp(WATCH_CANCEL))
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const [, trainNumber, fromId, toId, date] = ctx.match;
		const userData = await this.userRedis.getData(userId);

		if (!trainNumber || !fromId || !toId || !date) {
			const message = await ctx.reply('❌ Ошибка! Не удалось отменить');
			ctx.session.messageIds.push(message.message_id);
			return;
		}

		const findSchedule = userData.activeSchedules.find(
			(schedule) =>
				schedule.routeId === `${this.scheduleService.getKeyRoute(trainNumber, +fromId, +toId, date)}`,
		);

		if (findSchedule) {
			await this.scheduleService.stopUserWatch(userId, findSchedule?.routeId);
			const message = await ctx.reply('✅ <b>Отслеживание отменено</b>\n\nПоезд больше не отслеживается.', { parse_mode: 'HTML' });
			ctx.session.messageIds.push(message.message_id);
		} else {
			const message = await ctx.reply('❌ <b>Ошибка!</b>\n\nНе удалось отменить отслеживание. Возможно, оно уже было остановлено.', { parse_mode: 'HTML' });
			ctx.session.messageIds.push(message.message_id);
		}
	}
}

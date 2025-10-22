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
		const [_train, trainNumber, fromId, toId, date] = ctx.match;
		const userData = await this.userRedis.getData(userId);

		if (!trainNumber || !fromId || !toId || !date) {
			const message = await ctx.reply('❌ Ошибка! Не удалось отменить');
			ctx.session.messageIds.push(message.message_id);
			return;
		}

		const findSchedule = userData.activeSchedules.find(
			(schedule) =>
				schedule.routeId === `${this.scheduleService.getKeyRoute(+trainNumber, +fromId, +toId, date)}`,
		);

		if (findSchedule) {
			await this.scheduleService.stopUserWatch(userId, findSchedule?.routeId);
			const message = await ctx.reply('✅ Слежка за поездом отменена');
			ctx.session.messageIds.push(message.message_id);
		} else {
			const message = await ctx.reply('❌ Ошибка! Не удалось отменить');
			ctx.session.messageIds.push(message.message_id);
		}
	}
}

import { UserRedis, TemplateService, ScheduleService, TrainService } from '../../services';
import { WATCH_PLACE } from './consts';
import { Action } from '../../decorator';
import { ActionContext } from '../../types';

export class WatchPlaceAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly scheduleService: ScheduleService,
		private readonly trainService: TrainService,
	) {}

	@Action(new RegExp(WATCH_PLACE))
	async action(ctx: ActionContext) {
		const chatId = ctx.chat?.id;
		const trainNumber = ctx.match[1];
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		const { selectedYear, selectedMonth, selectedDay, cityFrom, cityTo } = userData;

		if (!cityFrom) {
			const message = await ctx.reply(this.templateService.noDepartureCity(), { parse_mode: 'HTML' });
			ctx.session.messageIds.push(message.message_id);
			return;
		}
		if (!cityTo || !chatId || !trainNumber) {
			const message = await ctx.reply(this.templateService.noArrivalCity(), { parse_mode: 'HTML' });
			ctx.session.messageIds.push(message.message_id);
			return;
		}

		const trains = await this.trainService.getTrains(userId);
		const findTrain = trains.find((train) => train.train_number === trainNumber);

		if (!findTrain) {
			const message = await ctx.reply('Ошибка...');
			ctx.session.messageIds.push(message.message_id);
			return;
		}

		const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

		await this.scheduleService.addScheduleWatch({
			cityFrom,
			cityTo,
			date,
			chatId,
			userId,
			trainNumber,
			train: findTrain,
		});
	}
}

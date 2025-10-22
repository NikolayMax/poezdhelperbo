import {UserRedis, TemplateService, ScheduleService, TrainService} from '../../services';
import { WATCH_PLACE } from './consts';
import { Action } from '../../decorator';
import { ActionContext } from '../../types';

export class WatchPlaceAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
        private readonly scheduleService: ScheduleService,
        private readonly trainService: TrainService
	) {}

	@Action(new RegExp(WATCH_PLACE))
	async action(ctx: ActionContext) {
        const chatId = ctx.chat?.id
        const trainNumber = +(ctx.match[1] as string);
        const userId = ctx.from.id;
        const trains = await this.trainService.getTrains(userId);
		const userData = await this.userRedis.getData(userId);
        const { selectedYear, selectedMonth, selectedDay, cityFrom, cityTo } = userData;
        const findTrain = trains.find((train) => train.train_number === `${trainNumber}`)


		if (!cityFrom) {
            const message = await ctx.reply(this.templateService.noDepartureCity());
            ctx.session.messageIds.push(message.message_id);
			return;
		}
		if (!cityTo || !chatId || !trainNumber) {
            const message = await ctx.reply(this.templateService.noArrivalCity())
            ctx.session.messageIds.push(message.message_id);
			return;
		}

        if(!findTrain) {
            const message = await ctx.reply('Ошибка...')
            ctx.session.messageIds.push(message.message_id);
            return;
        }

        const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

        await this.scheduleService.addScheduleWatch({cityFrom, cityTo, date, chatId, userId, trainNumber, train: findTrain});
	}
}

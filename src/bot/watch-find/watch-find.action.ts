import { InlineKeyboard } from 'grammy';
import { UserRedis, TemplateService, ApiService, ErrorService, TrainService } from '../../services';
import { Action } from '../../decorator';
import { WATCH_FIND_ACTION } from './consts';
import { ActionContext } from '../../types';

export class WatchFindAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly api: ApiService,
		private readonly errorService: ErrorService,
		private readonly trainService: TrainService,
	) {}

	@Action(WATCH_FIND_ACTION)
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);

		try {
			const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;

			const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

			if (!cityFrom) {
				await ctx.reply(this.templateService.noDepartureCity());
				return;
			}

			if (!cityTo) {
				await ctx.reply(this.templateService.noArrivalCity());
				return;
			}

			const { data, success } = await this.api.getSchedule(cityFrom.id, cityTo.id, date);

			if (!success) {
				await ctx.reply(this.errorService.serverError());
				return;
			}

			await this.trainService.setTrains(userId, data.data);

			if (data.data.length < 1) {
				await ctx.reply(await this.templateService.messageNotFoundTrains(ctx));
				return;
			}

			for (const train of data.data) {
				if (train.rail_type !== 'Комфортный') continue;

				const inlineKeyboard = new InlineKeyboard();
				if (train.places_count === null || train.places_count < 1) {
					inlineKeyboard.text(`🚆 Отследить: [${train.name}]`, `watch-place:${train.train_number}`);
				}

				const message = await ctx.reply(
					await this.templateService.generateDetailedTrainMessage(train, date, userData),
					{
						parse_mode: 'HTML',
						reply_markup: inlineKeyboard,
					},
				);
				ctx.session.messageIds.push(message.message_id);
			}
		} catch (e) {
			console.log(e);
			if (this.isError(e)) {
				const message = await ctx.reply(this.errorService.customError(e.message));
				ctx.session.messageIds.push(message.message_id);
			}
		}
	}

	isError(error: unknown): error is Error {
		return error instanceof Error;
	}
}

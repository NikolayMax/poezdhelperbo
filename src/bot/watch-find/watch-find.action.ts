import { InlineKeyboard } from 'grammy';
import {UserRedis, TemplateService, ApiService, ErrorService} from '../../services';
import { Action } from '../../decorator';
import { WATCH_FIND_ACTION } from './consts';
import { IUserData,ActionContext } from '../../types';

export class WatchFindAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly api: ApiService,
        private readonly errorService: ErrorService
	) {}

	@Action(WATCH_FIND_ACTION)
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
        const inlineKeyboard = new InlineKeyboard();

		try {
			const filteredTrains = await this.filterTrains(userData);

            if (typeof filteredTrains === 'string') {
				await ctx.reply(filteredTrains);
				return;
			}

            if (filteredTrains.length < 1) {
				await ctx.reply(await this.templateService.messageNotFoundTrains(ctx));
			}

			for (const train of filteredTrains) {
				if (train.countSeats < 1) {
					inlineKeyboard.text(`🚆 Отследить: [${train.TrainNumber}]`, `watch-place:${train.TrainNumber}`);
				}

				const message = await ctx.reply(this.templateService.generateDetailedTrainMessage(train), {
					parse_mode: 'HTML',
					reply_markup: inlineKeyboard,
				});
				ctx.session.messageIds.push(message.message_id);
			}
		} catch (e) {
			if (this.isError(e)) await ctx.reply(this.errorService.customError(e.message));
		}
	}

	async filterTrains(userData: IUserData) {
		userData.cities = [];
		const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;

        if (!cityFrom) {
			return this.templateService.noDepartureCity();
		}

		if (!cityTo) {
			return this.templateService.noArrivalCity();
		}

        const now = new Date();
		const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

		const {data: trains, success} = await this.api.searchRzdTickets(
			cityFrom.id.toString(),
			cityTo.id.toString(),
			date,
		);

        if(!success) {
            return this.errorService.serverError();
        }

		const unixTimestamp =
			now.getDate() === selectedDay
				? Math.floor(Date.now() / 1000 + 10)
				: new Date(selectedYear, selectedMonth, selectedDay).getTime() / 1000;

		const {data: trains2, success: success2} = await this.api.getSvrpkTickets(
			cityFrom.id,
			cityTo.id,
			unixTimestamp.toString(),
		);

        if(!success2) {
            return this.errorService.serverError();
        }

        return trains.Trains.filter((train) => {
			const trainFind = trains2.data.find((item) => item.number === train.TrainNumber);
			train.countSeats = trainFind ? trainFind.place_count : 0;

			return train.IsSuburban && train.CategoryId === 12;
		});
	}

    isError(error: unknown): error is Error {
        return error instanceof Error;
    }
}

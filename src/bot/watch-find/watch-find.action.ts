import { Context, Markup } from 'telegraf';
import { userRedis } from '../../services/user.service';
import { ITrain } from '../../types/svrpk-train.interface';
import { getSvrpkTickets, searchRzdTickets } from '../../api';
import { IRzdTrain } from '../../types/rzd-train.interface';
import messageService from '../../services/message-template.service';
import { Action } from '../../decorator/action.decorator';
import { WATCH_FIND_ACTION } from './consts';

class WatchFindAction {
	@Action(WATCH_FIND_ACTION)
	async action(ctx: Context) {
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
		const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;
		if (!cityFrom) {
			return messageService.noDepartureCity();
		}
		if (!cityTo) {
			return messageService.noArrivalCity();
		}
		userData.cities = [];

		const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
		const trains = await searchRzdTickets<{ Trains: IRzdTrain[] }>(cityFrom.id.toString(), cityTo.id.toString(), date);
		const unixTimestamp = Math.floor(new Date(selectedYear, selectedMonth, selectedDay).getTime() / 1000);
		const trains2 = await getSvrpkTickets<{ data: ITrain[] }>(cityFrom.id, cityTo.id, unixTimestamp.toString());

		const filteredTrains = trains.Trains.filter((train) => {
			const trainFind = trains2.data.find((item) => item.number === train.TrainNumber);
			train.countSeats = trainFind ? trainFind.place_count : 0;

			return train.IsSuburban && train.CategoryId === 12;
		});
		if (filteredTrains.length < 1) {
			ctx.reply(await messageService.messageNotFoundTrains(ctx));
		}
		filteredTrains.forEach((train) => {
			const inlineKeyboard = [];
			if (train.countSeats < 1) {
				inlineKeyboard.push(Markup.button.callback(`🚆 Отследить: [${train.TrainNumber}]`, `watch-place:${train.TrainNumber}`));
			}
			const keyboard = Markup.inlineKeyboard(inlineKeyboard);

			ctx.reply(messageService.generateDetailedTrainMessage(train), {
				parse_mode: 'HTML',
				...keyboard,
			});
		});
	}
}
const watchFindAction = new WatchFindAction();
export default watchFindAction;

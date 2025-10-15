import { Context } from 'telegraf';
import { addSchedule } from '../../utils/schedule';
import { getSvrpkTickets } from '../../api';
import { userRedis } from '../../services/user.service';
import messageService from '../../services/message-template.service';
import { WATCH_PLACE } from './consts';
import { Action } from '../../decorator/action.decorator';
import { ITrain } from '../../types/svrpk-train.interface';

class WatchPlaceAction {
	@Action(new RegExp(WATCH_PLACE))
	async action(ctx: Context) {
		if (!('match' in ctx)) {
			return ctx.reply('Error: match not found in ctx');
		}
		const findTrainId = (ctx.match as string[])[1];
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}

		const userId = ctx.from.id;
		const { selectedYear, selectedMonth, selectedDay, cityFrom, cityTo } = await userRedis.getData(userId);

		if (!cityFrom) {
			return messageService.noDepartureCity();
		}
		if (!cityTo) {
			return messageService.noArrivalCity();
		}

		const unixTimestamp = Math.floor(new Date(selectedYear, selectedMonth, selectedDay).getTime() / 1000);

		addSchedule({
			interval: 15000,
			duration: 24 * 60 * 60 * 1000,
			callback: async (time, stop) => {
				const trains = await getSvrpkTickets<{ data: ITrain[] }>(cityFrom.id, cityTo.id, unixTimestamp.toString());
				const findTrain = trains.data.find((train) => train.number === findTrainId);

				if (findTrain?.place_count && findTrain.place_count > 0) {
					console.log(findTrain);
					ctx.reply(messageService.generateDetailedFindTrainMessage(findTrain), {
						parse_mode: 'HTML',
					});
					stop();
				}
			},
		});
		await ctx.reply(await messageService.messageFindPlace(ctx));
	}
}
const watchPlaceAction = new WatchPlaceAction();
export default watchPlaceAction;

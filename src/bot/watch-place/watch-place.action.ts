import { UserRedis } from '../../services/user.service';
import { WATCH_PLACE } from './consts';
import { Action } from '../../decorator/action.decorator';
import { ITrain } from '../../types/svrpk-train.interface';
import { TemplateService } from '../../services/message-template.service';
import { ActionContext } from '../../types/bot.interface';
import { ApiService } from '../../services/api.service';

interface IScheduleProps {
	callback: (count: number, stop: () => void) => void;
	interval: number;
	duration: number;
}

export class WatchPlaceAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly api: ApiService,
	) {}

	@Action(new RegExp(WATCH_PLACE))
	async action(ctx: ActionContext) {
		const findTrainId = (ctx.match as string[])[1];

		const userId = ctx.from.id;
		const { selectedYear, selectedMonth, selectedDay, cityFrom, cityTo } = await this.userRedis.getData(userId);

		if (!cityFrom) {
			this.templateService.noDepartureCity();
			return;
		}
		if (!cityTo) {
			this.templateService.noArrivalCity();
			return;
		}

		const unixTimestamp = Math.floor(new Date(selectedYear, selectedMonth, selectedDay).getTime() / 1000);

		this.addSchedule({
			interval: 15000,
			duration: 24 * 60 * 60 * 1000,
			callback: async (_time, stop) => {
				const trains = await this.api.getSvrpkTickets<{ data: ITrain[] }>(
					cityFrom.id,
					cityTo.id,
					unixTimestamp.toString(),
				);
				const findTrain = trains.data.find((train) => train.number === findTrainId);

				if (findTrain?.place_count && findTrain.place_count > 0) {
					const message = await ctx.reply(this.templateService.generateDetailedFindTrainMessage(findTrain), {
						parse_mode: 'HTML',
					});
					ctx.session.messageIds.push(message.message_id);
					stop();
				}
			},
		});
		await ctx.reply(await this.templateService.messageFindPlace(ctx));
	}

	addSchedule = ({ callback, interval, duration }: IScheduleProps) => {
		let count = 0;
		let idInterval: null | NodeJS.Timeout = null;
		const stop = () => {
			if (idInterval) {
				clearInterval(idInterval);
				idInterval = null;
			}
		};
		idInterval = setInterval(() => {
			callback(++count, stop);
		}, interval);

		setTimeout(stop, duration);
	};
}

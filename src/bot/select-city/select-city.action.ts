import { WatchAction } from '../watch/watch.action';
import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { CurrentSelectCity, SELECT_CITY } from './consts';
import { ActionContext } from '../../types';

export class SelectCityAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly watchAction: WatchAction,
	) {}

	@Action(new RegExp(SELECT_CITY))
	async action(ctx: ActionContext) {
		const slug = (ctx.match as string[])[1];
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		const currentCity = userData?.cities?.find((city) => city.slug === slug);

		if (userData.currentSelectCity === CurrentSelectCity.From) {
			userData.cityFrom = currentCity;
		} else {
			userData.cityTo = currentCity;
		}

        userData.cities = []
        userData.currentSelectCity = undefined;

		await this.userRedis.setData(userId, userData);

		const { text, reply_markup } = await this.watchAction.buttons(ctx);
		const message = await ctx.reply(text, { reply_markup });
        ctx.session.messageIds.push(message.message_id);
	}
}

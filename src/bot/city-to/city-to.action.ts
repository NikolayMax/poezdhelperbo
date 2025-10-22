import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { CITY_TO_ACTION } from './consts';
import { CurrentSelectCity } from '../select-city/consts';
import { ActionContext } from '../../types';

export class CityToAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(CITY_TO_ACTION)
	async action(ctx: ActionContext) {
		const { text } = this.buttons();
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.To;
		await this.userRedis.setData(userId, userData);
		const message = await ctx.reply(text);
		ctx.session.messageIds.push(message.message_id);
	}

	buttons() {
		return {
			text: '🏙️ *Введите название города или станции:',
		};
	}
}

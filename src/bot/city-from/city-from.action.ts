import { UserRedis } from '../../services';
import { CITY_FROM_ACTION } from './consts';
import { Action } from '../../decorator';
import { CurrentSelectCity } from '../select-city/consts';
import { ActionContext } from '../../types';


export class CityFromAction {
	constructor(private readonly userRedis: UserRedis) { }

	@Action(CITY_FROM_ACTION)
	async action(ctx: ActionContext) {
		const { text } = this.buttons();
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.From;
		await this.userRedis.setData(userId, userData);
		const message = await ctx.reply(text);
		ctx.session.messageIds.push(message.message_id);
	}

	buttons() {
		return {
			text: 'Введите город откуда:',
		};
	}
}

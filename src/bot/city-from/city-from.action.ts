import { UserRedis } from '../../services';
import { CITY_FROM_ACTION } from './consts';
import { Action } from '../../decorator';
import { CurrentSelectCity } from '../select-city/consts';
import { ActionContext } from '../../types';

export class CityFromAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(CITY_FROM_ACTION)
	async action(ctx: ActionContext) {
		const { text } = this.buttons();
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.From;
		await this.userRedis.setData(userId, userData);
		const enterCityFromMessage = await ctx.reply(text);
		this.deleteMessage(ctx, enterCityFromMessage);
	}

	deleteMessage(ctx: ActionContext, enterCityFromMessage: any) {
		setTimeout(() => {
			if (!ctx.chat?.id) {
				return console.log('Error not found ctx.chat?.id');
			}
			ctx.api.deleteMessage(ctx.chat.id, enterCityFromMessage.message_id).catch((error) => {
				console.log(error);
			});
		}, 3000);
	}

	buttons() {
		return {
			text: 'Введите город откуда:',
		};
	}
}

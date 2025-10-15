import { userRedis } from '../../services/user.service';
import { CITY_FROM_ACTION } from './consts';
import { Action } from '../../decorator/action.decorator';
import { Context } from 'telegraf';
import messageService from '../../services/message-template.service';
import { CurrentSelectCity } from '../select-city/consts';

class CityFromAction {
	@Action(CITY_FROM_ACTION)
	async action(ctx: Context) {
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		const { text } = this.buttons();
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.From;
		await userRedis.setData(userId, userData);
		ctx.reply(text);
	}
	buttons() {
		return {
			text: 'Введите город откуда:',
		};
	}
}

const cityFromAction = new CityFromAction();
export default cityFromAction;

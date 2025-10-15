import { Context } from 'telegraf';
import { userRedis } from '../../services/user.service';
import { Action } from '../../decorator/action.decorator';
import messageService from '../../services/message-template.service';
import { CITY_TO_ACTION } from './consts';
import { CurrentSelectCity } from '../select-city/consts';

class CityToAction {
	@Action(CITY_TO_ACTION)
	async action(ctx: Context) {
		const { text } = this.buttons();
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.To;
		await userRedis.setData(userId, userData);
		ctx.reply(text);
	}

	buttons() {
		return {
			text: '🏙️ *Введите название города или станции:',
		};
	}
}
const cityToAction = new CityToAction();
export default cityToAction;

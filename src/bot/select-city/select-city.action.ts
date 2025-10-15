import { Context } from 'telegraf';
import watchAction from '../watch/watch.action';
import { userRedis } from '../../services/user.service';
import { Action } from '../../decorator/action.decorator';
import messageService from '../../services/message-template.service';
import { CurrentSelectCity, SELECT_CITY } from './consts';

class SelectCityAction {
	@Action(new RegExp(SELECT_CITY))
	async action(ctx: Context) {
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		if (!('match' in ctx)) {
			return ctx.reply('Error: match not found in ctx');
		}
		const slug = (ctx.match as string[])[1];
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
		const currentCity = userData?.cities?.find((city) => city.slug === slug);

		if (userData.currentSelectCity === CurrentSelectCity.From) {
			userData.cityFrom = currentCity;
		} else {
			userData.cityTo = currentCity;
		}

		await userRedis.setData(userId, userData);

		const { text, buttons } = await watchAction.buttons(ctx);
		ctx.reply(text, buttons);
	}
}
const selectCityAction = new SelectCityAction();
export default selectCityAction;

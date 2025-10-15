import { Markup, Context } from 'telegraf';
import { renderSelectDate, renderSelectFromCity, renderSelectToCity } from '../../utils/lib';
import { userRedis } from '../../services/user.service';
import { Action } from '../../decorator/action.decorator';
import { WATCH_ACTION } from './contst';
import { CITY_FROM_ACTION } from '../city-from/consts';
import { CITY_TO_ACTION } from '../city-to/consts';
import { START } from '../start/consts';
import { WATCH_DATE } from '../watch-date/consts';
import { WATCH_FIND_ACTION } from '../watch-find/consts';

class WatchAction {
	@Action(WATCH_ACTION)
	async action(ctx: Context) {
		const { text, buttons } = await this.buttons(ctx);
		ctx.reply(text, buttons);
	}

	async buttons(ctx: Context) {
		if (!ctx.from) {
			return {
				text: 'Не удалось получить информацию о пользователе',
				buttons: Markup.inlineKeyboard([]),
			};
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);

		return {
			text: 'Параметры поиска: ',
			buttons: Markup.inlineKeyboard([
				[Markup.button.callback(renderSelectDate(userData), WATCH_DATE)],
				[Markup.button.callback(renderSelectFromCity(userData), CITY_FROM_ACTION)],
				[Markup.button.callback(renderSelectToCity(userData), CITY_TO_ACTION)],
				[Markup.button.callback('НАЙТИ', WATCH_FIND_ACTION)],
				[Markup.button.callback('Главное меню', START)],
			]),
		};
	}
}
const watchAction = new WatchAction();
export default watchAction;

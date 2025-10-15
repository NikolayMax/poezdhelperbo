import { Markup, Context } from 'telegraf';
import { userRedis } from '../../services/user.service';
import { MonthNameRus, WATCH_DATE } from './consts';
import { Action } from '../../decorator/action.decorator';

class WatchAction {
	@Action(WATCH_DATE)
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
		const months = [];
		const userId = ctx.from.id;
		const { selectedMonth } = await userRedis.getData(userId);

		for (let i = selectedMonth ? selectedMonth : 0; i < 12; i++) {
			months.push(Markup.button.callback(MonthNameRus[i], `month:${i}`));
		}
		return {
			text: 'Выберите месяц: ',
			buttons: Markup.inlineKeyboard(months, { columns: 4 }),
		};
	}
}

const watchDate = new WatchAction();
export default watchDate;

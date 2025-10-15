import { Context, Markup } from 'telegraf';
import { Action } from '../../decorator/action.decorator';
import { ACTION_BALANCE } from './consts';
import { START } from '../start/consts';

class Balance {
	@Action(ACTION_BALANCE)
	action(ctx: Context) {
		const { text, buttons } = this.buttons();
		ctx.reply(text, buttons);
	}

	buttons() {
		return {
			text: 'Ваш Баланс: 10 запросов',
			buttons: Markup.inlineKeyboard([Markup.button.callback('Главное меню', START)]),
		};
	}
}
const balance = new Balance();
export default balance;

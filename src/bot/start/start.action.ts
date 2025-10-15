import { Context, Markup } from 'telegraf';
import { START } from './consts';
import { Action } from '../../decorator/action.decorator';
import { ACTION_BALANCE } from '../balance/consts';
import { WATCH_ACTION } from '../watch/contst';

class StartAction {
	@Action(START)
	action(ctx: Context) {
		const { text, buttons } = this.buttons();
		ctx.reply(text, buttons);
	}

	buttons() {
		return {
			text: 'Привет! Тут ты сможешь оследить свой поезд или электричку',
			buttons: Markup.inlineKeyboard([
				Markup.button.callback('Начать поиск', WATCH_ACTION),
				Markup.button.callback('Баланс', ACTION_BALANCE),
				Markup.button.callback('Помощь', '/help'),
			]),
		};
	}
}
const startAction = new StartAction();
export default startAction;

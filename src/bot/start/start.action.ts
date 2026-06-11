import { InlineKeyboard } from 'grammy';
import { START } from './consts';
import { Action } from '../../decorator';
import { WATCH_ACTION } from '../watch/contst';
import { ActionContext } from '../../types';
import { WATCH_ACTIVE } from '../watch-active/consts';

export class StartAction {
	@Action(START)
	async action(ctx: ActionContext) {
		const { text, reply_markup } = this.buttons();
		const message = await ctx.reply(text, { reply_markup });
		ctx.session.messageIds.push(message.message_id);
	}

	buttons() {
		const inlineKeyboard = new InlineKeyboard()
			.text('🎯 Начать поиск мест', WATCH_ACTION)
			.row()
			.text('🚊 Список активных поисков', WATCH_ACTIVE)
			.row()
			.text('❓ Помощь и поддержка', '/help');
		return {
			text: `
<b>Привет! 👋</b>

🚊 Я помогу найти свободные места в электричках и «Ласточках»!
✨ Просто выберите маршрут и дату, и я уведомлю вас, как только появятся места.

<b>Что я умею:</b>
• 🔍 Искать поезда по маршруту
• 🚆 Отслеживать конкретные поезда
• 🔔 Уведомлять о появлении мест

Готовы начать? Нажмите кнопку ниже! 💥
			`.trim(),
			reply_markup: inlineKeyboard,
		};
	}
}

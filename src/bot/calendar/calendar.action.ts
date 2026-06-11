import { InlineKeyboard } from 'grammy';
import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { CALENDAR_PATTERN } from './consts';
import { WatchAction } from '../watch/watch.action';
import { ActionContext } from '../../types';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

function getStartOffset(year: number, month: number): number {
	const day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
}

export function renderCalendar(year: number, month: number): InlineKeyboard {
	const inlineKeyboard = new InlineKeyboard();

	inlineKeyboard.text('📅 Сегодня', 'calendar:today').text('📅 Завтра', 'calendar:tomorrow');
	inlineKeyboard.row();

	for (const wd of WEEKDAYS) {
		inlineKeyboard.text(wd, 'calendar:noop');
	}
	inlineKeyboard.row();

	const offset = getStartOffset(year, month);
	for (let i = 0; i < offset; i++) {
		inlineKeyboard.text(' ', 'calendar:noop');
	}

	const daysInMonth = getDaysInMonth(year, month);
	for (let day = 1; day <= daysInMonth; day++) {
		inlineKeyboard.text(`${day}`, `calendar:day:${day}`);

		if ((offset + day) % 7 === 0 && day < daysInMonth) {
			inlineKeyboard.row();
		}
	}
	inlineKeyboard.row();

	inlineKeyboard.text('←', 'calendar:nav:prev').text(`${MONTHS[month]} ${year}`, 'calendar:noop').text('→', 'calendar:nav:next');

	return inlineKeyboard;
}

export class CalendarAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly watchAction: WatchAction,
	) {}

	@Action(new RegExp(CALENDAR_PATTERN))
	async action(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);

		const action = ctx.match[1] as string;
		const value = ctx.match[2] as string | undefined;

		switch (action) {
			case 'today': {
				const now = new Date();
				userData.selectedYear = now.getFullYear();
				userData.selectedMonth = now.getMonth();
				userData.selectedDay = now.getDate();
				await this.userRedis.setData(userId, userData);
				await ctx.deleteMessage().catch(() => {});
				await this.showWatchParams(ctx);
				return;
			}
			case 'tomorrow': {
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				userData.selectedYear = tomorrow.getFullYear();
				userData.selectedMonth = tomorrow.getMonth();
				userData.selectedDay = tomorrow.getDate();
				await this.userRedis.setData(userId, userData);
				await ctx.deleteMessage().catch(() => {});
				await this.showWatchParams(ctx);
				return;
			}
			case 'day': {
				userData.selectedDay = Number(value);
				await this.userRedis.setData(userId, userData);
				await ctx.deleteMessage().catch(() => {});
				await this.showWatchParams(ctx);
				return;
			}
			case 'nav': {
				if (value === 'prev') {
					userData.selectedMonth--;
					if (userData.selectedMonth < 0) {
						userData.selectedMonth = 11;
						userData.selectedYear--;
					}
				} else {
					userData.selectedMonth++;
					if (userData.selectedMonth > 11) {
						userData.selectedMonth = 0;
						userData.selectedYear++;
					}
				}
				await this.userRedis.setData(userId, userData);
				const keyboard = renderCalendar(userData.selectedYear, userData.selectedMonth);
				try {
					await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
				} catch {
					const message = await ctx.reply('📅 Выберите дату:', { reply_markup: keyboard });
					ctx.session.messageIds.push(message.message_id);
				}
				return;
			}
			case 'noop': {
				await ctx.answerCallbackQuery();
				return;
			}
		}
	}

	private async showWatchParams(ctx: ActionContext) {
		const { text, reply_markup } = await this.watchAction.buttons(ctx);
		const message = await ctx.reply(text, { reply_markup });
		ctx.session.messageIds.push(message.message_id);
	}
}

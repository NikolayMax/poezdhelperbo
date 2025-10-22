import { InlineKeyboard } from 'grammy';
import { UserRedis } from '../../services';
import { Action } from '../../decorator';
import { WATCH_ACTION } from './contst';
import { CITY_FROM_ACTION } from '../city-from/consts';
import { CITY_TO_ACTION } from '../city-to/consts';
import { START } from '../start/consts';
import { WATCH_DATE } from '../watch-date/consts';
import { WATCH_FIND_ACTION } from '../watch-find/consts';
import { IUserData, ActionContext } from '../../types';

export class WatchAction {
	constructor(private readonly userRedis: UserRedis) {}

	@Action(WATCH_ACTION)
	async action(ctx: ActionContext) {
		const { text, reply_markup } = await this.buttons(ctx);
		const message = await ctx.reply(text, { reply_markup });
        ctx.session.messageIds.push(message.message_id);
	}

	async buttons(ctx: ActionContext) {
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		const inlineKeyboard = new InlineKeyboard()
			.text(this.renderSelectDate(userData), WATCH_DATE)
			.row()
			.text(this.renderSelectFromCity(userData), CITY_FROM_ACTION)
			.row()
			.text(this.renderSelectToCity(userData), CITY_TO_ACTION)
			.row()
			.text('🚀 НАЙТИ', WATCH_FIND_ACTION)
			.row()
			.text('🏠 Главное меню', START)
			.row();
		return {
			text: '⚙️ Параметры поиска:',
			reply_markup: inlineKeyboard,
		};
	}

	renderSelectDate(userData: IUserData) {
		const isSelectDate = this.isSelectedDate(userData);
		const { selectedYear, selectedMonth, selectedDay } = userData;

		return `📆 Выберите дату поездки: ${
			isSelectDate
				? `✅ ${selectedDay.toString().padStart(2, '0')}.${(selectedMonth + 1).toString().padStart(2, '0')}.${selectedYear}`
				: ''
		}`;
	}

	renderSelectFromCity({ cityFrom }: IUserData) {
		return `📍 Откуда: ${cityFrom ? `✅ ${cityFrom.name}` : ''}`;
	}

	renderSelectToCity({ cityTo }: IUserData) {
		return `📍 Куда: ${cityTo ? `✅ ${cityTo.name}` : ''}`;
	}

	isSelectedDate({ selectedYear, selectedMonth, selectedDay }: IUserData) {
		return selectedYear !== undefined && selectedMonth !== undefined && selectedDay !== undefined;
	}
}

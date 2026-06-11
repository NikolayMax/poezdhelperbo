import { Context } from 'grammy';
import { UserRedis } from './user.service';
import { IUserData, ITrainSchedule } from '../types';

function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split('-');
	return `${d}.${m}.${y}`;
}

export class TemplateService {
	constructor(private readonly userRedis: UserRedis) {}

	messageCityNotFound(message: string) {
		return `
😕 <b>Город не найден</b>

К сожалению, я не смог найти населённый пункт «${message}».

<b>Что можно сделать?</b>
• ✏️ <b>Проверьте написание</b>. Возможно, в названии есть опечатка.
• 🧭 <b>Уточните название</b>. Используйте официальное название станции или города. Например, не «СПб», а «Санкт-Петербург».
• 🗺️ <b>Введите крупный город рядом</b>. Я ищу станции в основном составе направлений.
        `.trim();
	}

	noDepartureCity() {
		return '📍 <b>Не выбран город отправления</b>\nПожалуйста, выберите станцию отправления, нажав на соответствующую кнопку.';
	}
	noArrivalCity() {
		return '🎯 <b>Не выбран город назначения</b>\nПожалуйста, выберите станцию назначения, нажав на соответствующую кнопку.';
	}

async messageNotFoundTrains(ctx: Context) {
		if (!ctx.from) {
			return 'Не удалось получить информацию о пользователе';
		}
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;

		if (!cityFrom || !cityTo) {
			return '❓ Не выбраны города отправления или назначения';
		}

		const date = `${selectedDay.toString().padStart(2, '0')}.${(selectedMonth + 1).toString().padStart(2, '0')}.${selectedYear}`;
		return `
😔 <b>Поездов не найдено</b>

По маршруту <b>${cityFrom.name} → ${cityTo.name}</b> на <b>${date}</b> электричек не найдено.

<b>Что можно сделать?</b>
• 📅 Изменить дату поездки
• 🏙️ Проверить правильность названий городов
• 🚉 Выбрать соседние крупные станции

Хотите попробовать другой маршрут? Нажмите "🎯 Начать поиск мест" в главном меню.
        `.trim();
	}

	generateSeatsMessage(count: number | null) {
		if (!count || count < 1) {
			return '❌ Мест нет';
		}

		return `▫️ ${count} мест •`;
	}

	async generateDetailedTrainMessage(
		train: ITrainSchedule,
		date: string,
		userData: Pick<IUserData, 'cityFrom' | 'cityTo'>,
		isPlace: boolean = false,
	) {
		const { cityFrom, cityTo } = userData;

		const seatsMessage = this.generateSeatsMessage(train.places_count);

		return `
${isPlace ? '‼️‼️‼️ <b>НАШЛОСЬ МЕСТО!</b> ‼️‼️‼️\n' : ''}
🚂 <b>Поезд ${train.train_number}</b>
${train.name ? `   <i>${train.name}</i>\n` : ''}
━━━━━━━━━━━━━━━━━━
📅 <b>Дата:</b> ${formatDate(date)}
🕒 <b>Время:</b> ${train.departure_time} → ${train.arrival_time}

🏁 <b>Маршрут:</b>
   ▫️ Отправление: ${cityFrom?.name || '❓ Не указано'}
   ▫️ Прибытие: ${cityTo?.name || '❓ Не указано'}

${seatsMessage ? `🎫 <b>Доступные места:</b> ${seatsMessage}\n` : '❌ <b>Мест нет</b>\n'}
━━━━━━━━━━━━━━━━━━
        `.trim();
	}
}

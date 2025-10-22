import { Context } from 'grammy';
import { UserRedis } from './user.service';
import { IUserData, ITrainSchedule } from '../types';

export class TemplateService {
	constructor(private readonly userRedis: UserRedis) {}

	messageCityNotFound(message: string) {
		return `
😕 *Город не найден*

К сожалению, я не смог найти населённый пункт «${message}».

*Что можно сделать?*
• ✏️ *Проверьте написание*. Возможно, в названии есть опечатка.
• 🧭 *Уточните название*. Используйте официальное название станции или города. Например, не «СПб», а «Санкт-Петербург».
• 🗺️ *Введите крупный город рядом*. Я ищу станции в основном составе направлений.
        `.trim();
	}

	noDepartureCity() {
		return '📍 *Не выбран город отправления*...';
	}
	noArrivalCity() {
		return '🎯 *Не выбран город назначения*...';
	}

	async messageNotFoundTrains(ctx: Context) {
		if (!ctx.from) {
			return 'Не удалось получить информацию о пользователе';
		}
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;

		if (!cityFrom || !cityTo) {
			return 'Не выбраны города или город';
		}
		return `
            😔 *Ничего не найдено*
        
            По вашему запросу "[${cityFrom.name}] → [${cityTo.name}] на [${selectedDay.toString().padStart(2, '0')}.${selectedMonth + 1}.${selectedYear}]" электричек не найдено.
            
            *Попробуйте:*
            • Изменить дату поездки
            • Проверить написание городов
            • Выбрать соседние крупные станции
            
            Хотите попробовать другой маршрут?
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
${isPlace ? '‼️‼️‼️<b>НАШЛОСЬ МЕСТО</b>‼️‼️‼️' : ''}
🚂 <b>Поезд ${train.train_number}</b>${train.name ? ` - ${train.name}` : ''}

📅 <b>Дата:</b> ${date}
🕒 <b>Время:</b> ${train.departure_time} → ${train.arrival_time}

🏁 <b>Станции:</b>
▫️ Отправление: ${cityFrom?.name}
▫️ Прибытие: ${cityTo?.name}


${seatsMessage}
        `.trim();
	}
}

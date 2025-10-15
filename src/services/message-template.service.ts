import { Context } from 'telegraf';
import { userRedis } from './user.service';
import { IRzdTrain } from '../types/rzd-train.interface';
import { ITrain } from '../types/traine.interface';

class MessageTemplateService {
	async messageNotFoundTrains(ctx: Context) {
		if (!ctx.from) {
			return 'Не удалось получить информацию о пользователе';
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);
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

	async messageFindPlace(ctx: Context) {
		if (!('match' in ctx)) return 'Error: messageFindPlace not found match in ctx';

		if (!ctx.from) {
			return 'Не удалось получить информацию о пользователе';
		}

		const userId = ctx.from.id;
		const { selectedYear, selectedMonth, selectedDay, cityFrom, cityTo } = await userRedis.getData(userId);
		if (!cityFrom) {
			return this.noDepartureCity();
		}
		if (!cityTo) {
			return this.noArrivalCity();
		}

		return `
🔍 *Поиск места активирован*

Ваш запрос принят в работу! Теперь мы будем автоматически проверять наличие мест для вас в течение *24 часов*.

*Детали запроса:*
• 🚆 Направление: [${cityFrom?.name}] — [${cityTo?.name}]
• 📅 Дата: [${selectedDay}.${selectedMonth + 1}.${selectedYear}]

Как только свободное место будет найдено, вы получите уведомление в этом чате.

*Ожидайте обновлений!* ⏳
        `.trim();
	}
	generateDetailedFindTrainMessage(train: ITrain) {
		const seatsMessage = this.generateSeatsMessage(train.place_count);

		return `
‼️‼️‼️<b>НАШЛОСЬ МЕСТО</b>‼️‼️‼️
🚂 <b>Поезд ${train.number}</b>${train.name ? ` - ${train.name}` : ''}

📅 <b>Дата:</b> ${train.departure_data.date}
🕒 <b>Время:</b> ${train.departure_data.time} → ${train.arrival_data.time}
⏱ <b>В пути:</b> ${train.travel_time}

🏁 <b>Станции:</b>
▫️ Отправление: ${train.departure_data.station}
▫️ Прибытие: ${train.arrival_data.station}

${seatsMessage}
        `.trim();
	}

	generateDetailedTrainMessage(train: IRzdTrain) {
		// Форматируем время в пути
		const tripDurationHours = Math.floor(train.TripDuration / 60);
		const tripDurationMinutes = train.TripDuration % 60;
		const travelTime = `${tripDurationHours}ч ${tripDurationMinutes}м`;

		// Форматируем дату и время
		const departureDate = new Date(train.LocalDepartureDateTime).toLocaleDateString('ru-RU');
		const departureTime = new Date(train.LocalDepartureDateTime).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		});
		const arrivalTime = new Date(train.LocalArrivalDateTime).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		});

		// Генерируем сообщение о местах
		const seatsMessage = this.generateSeatsMessage(train.countSeats);

		return `
🚂 <b>Поезд ${train.TrainNumber}</b>${train.TrainName ? ` - ${train.TrainName}` : ''}

📅 <b>Дата:</b> ${departureDate}
🕒 <b>Время:</b> ${departureTime} → ${arrivalTime}
⏱ <b>В пути:</b> ${travelTime}
📏 <b>Расстояние:</b> ${train.TripDistance} км

🏁 <b>Станции:</b>
▫️ Отправление: ${train.OriginName}
▫️ Прибытие: ${train.DestinationName}

🚉 <b>Маршрут:</b>
▫️ Начальная: ${train.InitialStationName}
▫️ Конечная: ${train.FinalStationName}

${seatsMessage}
        `.trim();
	}
	generateSeatsMessage(count: number) {
		if (count < 1) {
			return '❌ Мест нет';
		}

		return `▫️ ${typeof count === 'number' ? count : 0} мест •`;
	}
	noDepartureCity() {
		return '📍 *Не выбран город отправления*...';
	}
	noArrivalCity() {
		return '🎯 *Не выбран город назначения*...';
	}
	messageEmpty() {
		return '❓ *Пустой запрос*';
	}
	userDataError() {
		return "'Не удалось получить информацию о пользователе'";
	}
	messageCityNotFound() {
		return `
😕 *Город не найден*

К сожалению, я не смог найти населённый пункт «*[Введенное пользователем название]*».

*Что можно сделать?*
• ✏️ *Проверьте написание*. Возможно, в названии есть опечатка.
• 🧭 *Уточните название*. Используйте официальное название станции или города. Например, не «СПб», а «Санкт-Петербург».
• 🗺️ *Введите крупный город рядом*. Я ищу станции в основном составе направлений.
        `.trim();
	}
}
const messageService = new MessageTemplateService();
export default messageService;

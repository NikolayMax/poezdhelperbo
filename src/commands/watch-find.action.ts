import { Markup, Telegraf } from "telegraf";
import { CommandsName } from "../consts";
import axios from "axios";
import { userRedis } from "../redis";
import { ITrain } from "../types/traine.interface";
import { searchRzdTickets } from "../search.tickets";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.WatchFind, async (ctx) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);
        userData.cities = [];
        console.log(userData);
        const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;

        if (!cityFrom || !cityTo)
            return ctx.reply('Не выбраны города или город');


        const trains = await searchRzdTickets(cityFrom.id, cityTo.id, `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`)

        console.log(trains)
        trains.Trains.filter(train => train.IsSuburban === true).forEach((train) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback("Отследить место", `watch-place:${train.id}`),
            ])
            ctx.reply(generateDetailedTrainMessage(train), {
                parse_mode: 'HTML',
                ...keyboard
            })
        })
    })
}
function generateDetailedTrainMessage(train: any) {
    // Форматируем время в пути
    const tripDurationHours = Math.floor(train.TripDuration / 60);
    const tripDurationMinutes = train.TripDuration % 60;
    const travelTime = `${tripDurationHours}ч ${tripDurationMinutes}м`;

    // Форматируем дату и время
    const departureDate = new Date(train.LocalDepartureDateTime).toLocaleDateString('ru-RU');
    const departureTime = new Date(train.LocalDepartureDateTime).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const arrivalTime = new Date(train.LocalArrivalDateTime).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Генерируем сообщение о местах
    const seatsMessage = generateSeatsMessage(train.CarGroups);

    // Определяем минимальную цену
    let minPrice = null;
    if (train.CarGroups && train.CarGroups.length > 0) {
        minPrice = Math.min(...train.CarGroups.map((car: any) => car.MinPrice).filter((price: any) => price !== null));
    }

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

${minPrice ? `💰 <b>Стоимость:</b> от ${Math.round(minPrice)} ₽` : '💰 <b>Стоимость:</b> Информация отсутствует'}
  `.trim();
}
function generateSeatsMessage(count: number) {
    if (count < 1) {
        return '❌ Мест нет';
    }

    return `▫️ ${count} мест •`;
}
export default action;

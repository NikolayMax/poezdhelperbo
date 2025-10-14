import {IRzdTrain} from "../types/rzd-train.interface";

export function generateDetailedTrainMessage(train: IRzdTrain) {
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
    const seatsMessage = generateSeatsMessage(train.countSeats);


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


function generateSeatsMessage(count: number) {
    if (count < 1) {
        return '❌ Мест нет';
    }

    return `▫️ ${typeof count === 'number' ? count : 0 } мест •`;
}
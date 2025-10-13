/**
 * Функция для поиска ж/д билетов через официальный API РЖД
 * @param {string} origin - Код станции отправления
 * @param {string} destination - Код станции назначения  
 * @param {string} departureDate - Дата в формате YYYY-MM-DD
 * @param {Object} options - Дополнительные параметры
 * @returns {Promise<Object>} - Данные о поездах и ценах
 */
// @ts-ignore
export async function searchRzdTickets(origin, destination, departureDate, options = {}) {
  const baseUrl = 'https://ticket.rzd.ru/api/v1/railway-service/prices/train-pricing';

  // Параметры по умолчанию (как в вашем запросе)
  const defaultParams = {
    service_provider: 'B2B_RZD',
    getByLocalTime: true,
    carGrouping: 'DontGroup',
    specialPlacesDemand: 'StandardPlacesAndForDisabledPersons',
    carIssuingType: 'Passenger',
    getTrainsFromSchedule: true,
    adultPassengersQuantity: 1,
    childrenPassengersQuantity: 0,
    hasPlacesForLargeFamily: false,
    ...options // Позволяет переопределить параметры
  };

  // Формируем полную дату-время
  const fullDepartureDate = `${departureDate}T00:00:00`;
  // @ts-ignore
  const params = new URLSearchParams({
    origin: origin,
    destination: destination,
    departureDate: fullDepartureDate,
    ...defaultParams
  });

  const url = `${baseUrl}?${params}`;

  try {
    console.log('Выполняем запрос к:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // РЖД часто требует определенные заголовки
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://ticket.rzd.ru/',
        'Origin': 'https://ticket.rzd.ru'
      },
      // Для API запросов важно указать credentials
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Ошибка при запросе к API РЖД:', error);
    throw error;
  }
}

// Пример использования
export async function getRzdTrains() {
  try {
    const data = await searchRzdTickets(
      '2040000', // Челябинск-Главный
      '2040388', // Карталы 1  
      '2025-10-17' // Дата
    );

    console.log('Данные получены успешно!');

    // Анализируем пригородные поезда
    analyzeTrains(data);

    return data;

  } catch (error) {
    console.error('Не удалось получить данные:', error);
  }
}


function analyzeTrains(trainData) {
  if (!trainData || !trainData.Trains) {
    console.log('Нет данных о поездах');
    return;
  }

  const allTrains = trainData.Trains;
  const suburbanTrains = allTrains.filter(train => train.IsSuburban);
  const longDistanceTrains = allTrains.filter(train => !train.IsSuburban);

  console.log(`\n=== ОБЩАЯ СТАТИСТИКА ===`);
  console.log(`Всего поездов: ${allTrains.length}`);
  console.log(`Дальних поездов: ${longDistanceTrains.length}`);
  console.log(`Пригородных поездов: ${suburbanTrains.length}`);

  // Анализ пригородных поездов
  console.log(`\n=== ПРИГОРОДНЫЕ ПОЕЗДА ===`);

  if (suburbanTrains.length === 0) {
    console.log('Пригородные поезда не найдены');
    return;
  }

  suburbanTrains.forEach((train, index) => {
    console.log(`\n${index + 1}. ${train.TrainNumber} - ${train.TrainDescription || 'Пригородный'}`);
    console.log(`   Маршрут: ${train.OriginName} → ${train.DestinationName}`);
    console.log(`   Время: ${formatTime(train.LocalDepartureDateTime)} → ${formatTime(train.LocalArrivalDateTime)}`);
    console.log(`   В пути: ${Math.round(train.TripDuration / 60)} ч ${train.TripDuration % 60} мин`);
    console.log(`   Продажа: ${train.IsSaleForbidden ? 'ЗАПРЕЩЕНА ❌' : 'разрешена ✅'}`);
    console.log(`   Данные о местах: ${train.CarGroups && train.CarGroups.length > 0 ? 'Есть 🟢' : 'Нет 🔴'}`);
    console.log(`   Электронная регистрация: ${train.HasElectronicRegistration ? 'Да' : 'Нет'}`);
    console.log(`   Перевозчик: ${train.CarrierDisplayNames ? train.CarrierDisplayNames.join(', ') : 'Не указан'}`);
  });

  // Статистика по доступности
  const analysis = analyzeAvailability(suburbanTrains);
  console.log(`\n=== СТАТИСТИКА ДОСТУПНОСТИ ===`);
  console.log(`Можно купить онлайн: ${analysis.availableForBooking}`);
  console.log(`С данными о местах: ${analysis.withPlaceData}`);
  console.log(`Продажа запрещена: ${analysis.saleForbidden}`);
}

/**
 * Анализирует доступность пригородных поездов
 */
function analyzeAvailability(trains) {
  return {
    total: trains.length,
    availableForBooking: trains.filter(t => !t.IsSaleForbidden).length,
    withPlaceData: trains.filter(t => t.CarGroups && t.CarGroups.length > 0).length,
    saleForbidden: trains.filter(t => t.IsSaleForbidden).length
  };
}

/**
 * Форматирует время для удобного отображения
 */
function formatTime(dateTimeString) {
  if (!dateTimeString) return '--:--';
  return new Date(dateTimeString).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

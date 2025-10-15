export async function searchRzdTickets<T>(
  origin: string,
  destination: string,
  departureDate: string,
  options: Record<string, string> = {},
): Promise<T> {
  const baseUrl =
    'https://ticket.rzd.ru/api/v1/railway-service/prices/train-pricing';

  // Параметры по умолчанию (как в вашем запросе)
  const defaultParams = {
    service_provider: 'B2B_RZD',
    getByLocalTime: 'true',
    carGrouping: 'DontGroup',
    specialPlacesDemand: 'StandardPlacesAndForDisabledPersons',
    carIssuingType: 'Passenger',
    getTrainsFromSchedule: 'true',
    adultPassengersQuantity: '1',
    childrenPassengersQuantity: '0',
    hasPlacesForLargeFamily: 'false',
    ...options,
  };

  // Формируем полную дату-время
  const fullDepartureDate = `${departureDate}T00:00:00`;

  const params = new URLSearchParams({
    origin: origin,
    destination: destination,
    departureDate: fullDepartureDate,
    ...defaultParams,
  });

  const url = `${baseUrl}?${params}`;

  try {
    console.log('Выполняем запрос к:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // РЖД часто требует определенные заголовки
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://ticket.rzd.ru/',
        Origin: 'https://ticket.rzd.ru',
      },
      // Для API запросов важно указать credentials
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при запросе к API РЖД:', error);
    throw error;
  }
}

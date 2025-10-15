export const getSvrpkTickets = async <T>(
  station_from: number,
  station_to: number,
  date: string,
): Promise<T> => {
  const baseUrl = 'https://api.svrpk.ru/api/v1/train-tickets';
  const params = new URLSearchParams({
    station_from: station_from.toString(),
    station_to: station_to.toString(),
    date,
  });
  const url = `${baseUrl}?${params}`;

  try {
    console.log('Выполняем запрос к:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
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
};

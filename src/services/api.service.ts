export class ApiService {
	private fetchSettings = {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		},
		credentials: 'include',
	} as const;

	constructor() {}

	async getSvrpkTickets<T>(station_from: number, station_to: number, date: string): Promise<T> {
		const params = new URLSearchParams({
			station_from: station_from.toString(),
			station_to: station_to.toString(),
			date,
		});
		const url = `https://api.svrpk.ru/api/v1/train-tickets?${params}`;

		try {
			console.log('Выполняем запрос к:', url);

			const response = await fetch(url, this.fetchSettings);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Ошибка при запросе к API РЖД:', error);
			throw error;
		}
	}

	async searchRzdTickets<T>(
		origin: string,
		destination: string,
		departureDate: string,
		options: Record<string, string> = {},
	): Promise<T> {
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

		const url = `https://ticket.rzd.ru/api/v1/railway-service/prices/train-pricing?${params}`;

		try {
			console.log('Выполняем запрос к:', url);

			const response = await fetch(url, this.fetchSettings);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Ошибка при запросе к API РЖД:', error);
			throw error;
		}
	}
}

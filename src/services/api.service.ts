import {HttpClientService} from "./http-client.service";
import {ICity, ITrain,IRzdTrain} from "../types";

export class ApiService {
    constructor(private readonly httpClientService: HttpClientService) {}

    async searchStation(name: string){
        return await this.httpClientService.get<{data: ICity[]}>(`https://api.svrpk.ru/api/v1/suggest/stations?name=${name}`)
    }

	async getSvrpkTickets(station_from: number, station_to: number, date: string) {
		const params = new URLSearchParams({
			station_from: station_from.toString(),
			station_to: station_to.toString(),
			date,
		});

        return await this.httpClientService.get<{ data: ITrain[] }>(`https://api.svrpk.ru/api/v1/train-tickets?${params}`);
    }

	async searchRzdTickets(
		origin: string,
		destination: string,
		departureDate: string
	) {
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
		};

		const fullDepartureDate = `${departureDate}T00:00:00`;

		const params = new URLSearchParams({
			origin: origin,
			destination: destination,
			departureDate: fullDepartureDate,
			...defaultParams,
		});

		const url = `https://ticket.rzd.ru/api/v1/railway-service/prices/train-pricing?${params}`;
        return await this.httpClientService.get<{ Trains: IRzdTrain[] }>(url);
	}
}

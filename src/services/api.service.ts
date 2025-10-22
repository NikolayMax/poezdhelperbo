import { HttpClientService } from "./http-client.service";
import { ICity, ITrainSchedule } from "../types";


export class ApiService {
    constructor(private readonly httpClientService: HttpClientService) { }

    async searchStation(name: string) {
        return await this.httpClientService.get<{ data: ICity[] }>(`https://api.svrpk.ru/api/v1/suggest/stations?name=${name}`)
    }

    async getSchedule(station_from: number, station_to: number, date: string) {
        const params = new URLSearchParams({
            date,
            count: "20"
        })
        const url = `https://api.svrpk.ru/api/v1/trains/find-by/stations/${station_from}/${station_to}?${params}`;
        console.log("запрос: ", url);
        return this.httpClientService.get<{ data: ITrainSchedule[] }>(url);
    }
}

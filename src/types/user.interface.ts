import { ICity } from './city.interface';
import { CurrentSelectCity } from '../bot/select-city/consts';
import { TKeyRoute } from "./schedule.interface";


export interface IUserSchedule {
	routeId: TKeyRoute;
	startTime: string; // ISO string
	spentSeconds: number;
}

export interface IUserData {
	chatId?: number;
	selectedYear: number;
	selectedMonth: number;
	selectedDay: number;

	cityFrom?: ICity;
	cityTo?: ICity;

	currentSelectCity?: CurrentSelectCity;
	cities: ICity[];
	activeSchedules: IUserSchedule[];
    messageIds: number[]
}

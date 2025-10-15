import { ICity } from './city.interface';
import { CurrentSelectCity } from '../bot/select-city/consts';

export interface IUserData {
	selectedYear: number;
	selectedMonth: number;
	selectedDay: number;

	cityFrom?: ICity;
	cityTo?: ICity;

	currentSelectCity?: CurrentSelectCity;
	cities?: ICity[];
}

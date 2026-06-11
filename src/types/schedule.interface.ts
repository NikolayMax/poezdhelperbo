import { ICity } from './city.interface';
import { ITrainSchedule } from './train-schedule.interface';

export interface IWatchSchedule {
	trainNumber: string;
	cityFrom: ICity;
	cityTo: ICity;
	date: string;
	departure_time: string;
	arrival_time: string;
	watchers: number[];
}

export interface IAddScheduleParams {
	userId: number;
	chatId: number;
	trainNumber: string;
	date: string;
	cityFrom: ICity;
	cityTo: ICity;
	train: ITrainSchedule;
}
type TTrainNumber = string;
type TFromId = number;
type TToId = number;
type TDate = string;

export type TKeyRoute = `train:${TTrainNumber}:${TFromId}:${TToId}:${TDate}`;

import { ICity } from './city.interface';
import { ITrainSchedule } from './train-schedule.interface';

export interface IWatchSchedule {
	trainNumber: number;
	cityFrom: ICity;
	cityTo: ICity;
	date: string;
	departure_time: string; //"12:35",
	arrival_time: string; //"15:10",
	watchers: number[];
}

export interface IAddScheduleParams {
	userId: number;
	chatId: number;
	trainNumber: number;
	date: string;
	cityFrom: ICity;
	cityTo: ICity;
	train: ITrainSchedule;
}
type TTrainNumber = number;
type TFromId = number;
type TToId = number;
type TDate = string;

export type TKeyRoute = `train:${TTrainNumber}:${TFromId}:${TToId}:${TDate}`;

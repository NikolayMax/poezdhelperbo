import {CurrentSelectCity} from "../utils/consts";
import {ICity} from "./svrpk-train.interface";

export interface IUserData {
    selectedYear: number;
    selectedMonth: number;
    selectedDay: number;

    cityFrom?: ICity;
    cityTo?: ICity;

    currentSelectCity?: CurrentSelectCity;
    cities?: ICity[]
}
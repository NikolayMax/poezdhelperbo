import {CurrentSelectCity} from "../consts";

interface ICity{
    id: number,
    name: string,
    slug: string,
    entity_type_id: number
}
export interface IUserData{
    selectedYear: number;
    selectedMonth: number;
    selectedDay: number;

    cityFrom?: ICity;
    cityTo?: ICity;


    currentSelectCity?: CurrentSelectCity;
    cities?: ICity[]
}
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

    currentSelectCity?: 'from' | 'to';
    cities?: ICity[];

    lastTrains?: Record<number, ITrain>;
    lastSearchDate?: string;
    lastSearchFromId?: number;
    lastSearchToId?: number;
}

interface ITrain {
    id: number;
    train_number: string;
    name: string;
    departure_time: string;
    arrival_time: string;
    places_count: number | null;
    station_from: string;
    station_to: string;
}
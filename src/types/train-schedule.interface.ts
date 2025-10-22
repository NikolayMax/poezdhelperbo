
export interface ITrainSchedule {
    id: number;
    train_number: string;
    name: string;
    rail_type: RailType;
    sub_type: string;
    departure_time: string; // format: "HH:MM"
    arrival_time: string;   // format: "HH:MM"
    is_time_stop_fixed: boolean;
    description: string | null;
    schedule_changes: string | null;
    station_from: string;   // код станции отправления
    station_to: string;     // код станции назначения
    places_count: number | null;
    is_personification_required: boolean;
}


export type RailType = 'Пригородный' | 'Комфортный' | 'Скоростной' | 'Скорый';

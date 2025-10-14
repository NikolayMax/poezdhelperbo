export interface ITrain{
    id: number,
    number: string,
    name: string,
    type_train_id: number,
    type_train: string,
    sub_type: string,
    is_time_stop_fixed: boolean,
    description: null,
    schedule_changes_text: null,
    place_count: number,
    is_personification_required: boolean,
    cost_data: {
        [key in string]:{
            cost: number,
            cost_formatted: string,
            name: string,
            cost2Way: null
        }
    },
    travel_time: string,
    departure_data: {
        id: string,
        station: string,
        station_id: number,
        time: string,
        date: string,
        timestamp: number
    },
    arrival_data: {
        id: string,
        station: string,
        station_id: number,
        time: string,
        date: string,
        timestamp: number
    }
}

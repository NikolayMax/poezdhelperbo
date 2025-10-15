export interface IRzdTrain {
	IsSuburban: boolean;
	TrainNumber: string;
	CategoryId: number;
	countSeats: number;
	TripDuration: number;
	TripDistance: number;

	LocalDepartureDateTime: string;
	LocalArrivalDateTime: string;

	TrainName: string;

	OriginName: string;
	DestinationName: string;

	InitialStationName: string;
	FinalStationName: string;
	TransportType: string;
	TrainDescription: string;
}

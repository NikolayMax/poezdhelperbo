import type { ITrain } from './traine.interface';

export interface ICity {
  name: string;
  slug: string;
  id: number;
  entity_type_id: number;
}

export interface IUserData {
  currentSelectCity?: 'from' | 'to';
  cities: ICity[];
  cityFrom?: ICity;
  cityTo?: ICity;
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  lastTrains?: Record<number, ITrain>;
  lastSearchDate?: string;
  lastSearchFromId?: number;
  lastSearchToId?: number;
  pendingReferral?: number;
}

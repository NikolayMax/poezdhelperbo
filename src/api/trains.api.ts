import axios from 'axios';
import type { ITrain } from '../types';
import type { ICity } from '../types/user.interface';

const BASE_URL = 'https://api.svrpk.ru/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

export const trainsApi = {
  async findTrains(fromId: number, toId: number, date: string): Promise<ITrain[]> {
    const url = `/trains/find-by/stations/${fromId}/${toId}?date=${date}&count=20`;
    try {
      const { data } = await api.get<{ data: ITrain[] }>(url);
      console.log(`[TRAINS API] findTrains OK fromId=${fromId} toId=${toId} date=${date} count=${data.data.length}`);
      return data.data;
    } catch (err: any) {
      console.error(`[TRAINS API] findTrains ERROR fromId=${fromId} toId=${toId} date=${date}:`, err?.message ?? err, err?.response?.status ?? '');
      throw err;
    }
  },

  async suggestStations(query: string): Promise<ICity[]> {
    const url = `/suggest/stations?name=${encodeURIComponent(query)}`;
    try {
      const { data } = await api.get<{ data: ICity[] }>(url);
      console.log(`[TRAINS API] suggestStations OK query=${query} count=${data.data.length}`);
      return data.data;
    } catch (err: any) {
      console.error(`[TRAINS API] suggestStations ERROR query=${query}:`, err?.message ?? err, err?.response?.status ?? '');
      throw err;
    }
  },
};

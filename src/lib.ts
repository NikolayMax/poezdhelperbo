import { MonthNameRus } from './consts';
import type { IUserData } from './types';

export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function renderSelectDate(data: IUserData): string {
  const month = MonthNameRus[data.selectedMonth] || '???';
  return `📅 ${data.selectedDay} ${month} ${data.selectedYear}`;
}

export function renderSelectFromCity(data: IUserData): string {
  return data.cityFrom
    ? `📍 Откуда: ${data.cityFrom.name}`
    : '📍 Откуда: выбрать';
}

export function renderSelectToCity(data: IUserData): string {
  return data.cityTo
    ? `📍 Куда: ${data.cityTo.name}`
    : '📍 Куда: выбрать';
}

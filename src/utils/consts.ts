export const enum CommandsName {
  Start = '/start',
  Help = '/help',
  Balance = '/balance',

  Watch = '/watch',
  WatchDate = '/watch-date',
  WatchFind = 'watch-find',
  WatchPlace = '^watch-place:([0-9]{1,15})$',

  CityFrom = '/coty-from',
  CityTo = '/city-to',

  Month = '^month:([0-9]{1,2})$',
  Day = '^day:([0-9]{1,2})$',
  SelectCity = '^select-city:([a-z\\-0-9]+)$',

  Message = '/message',
}
export const enum CurrentSelectCity {
  From = 'from',
  To = 'to',
}
export const MonthNameRus: string[] = [
  'янв.',
  'фев.',
  'мар.',
  'апр.',
  'мая',
  'июн.',
  'июл.',
  'авг.',
  'сен.',
  'окт.',
  'ноя.',
  'дек.',
];
export const MonthNameEng: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const CommandsName = {
    Start: 'start',
    Help: 'help',
    Balance: 'balance',

    Watch: 'watch',
    WatchDate: 'watch-date',
    WatchFind: 'watch-find',
    WatchPlace: '^watch-place:([0-9]{1,15})$',

    CityFrom: 'city-from',
    CityTo: 'city-to',

    Month: '^month:([0-9]{1,2})$',
    Day: '^day:([0-9]{1,2})$',
    SelectCity: '^select-city:([a-z\\-0-9]+)$',

    Message: 'message',

    Buy: 'buy',
    BuyPackageSmall: 'buy-package:small',
    BuyPackageMedium: 'buy-package:medium',

    CheckPayment: '^check-payment:([0-9]+)$',

    MyTrains: 'my-trains',
    RemoveTrack: '^remove-track:([0-9]+)$',

    AdminAddBalance: '^admin:add-balance:([0-9]+):([0-9]+)$',
} as const;

export const PACKAGES = [
    { key: 'small',  label: '10 запросов',  requests: 10,  price: 149 },
    { key: 'medium', label: '50 запросов',  requests: 50,  price: 499 },
] as const;

export const CurrentSelectCity = {
    From: 'from',
    To: 'to',
} as const;

export const MonthNameRus: string[] = [
    'янв.','фев.','мар.', 'апр.', 'мая', 'июн.',
    'июл.', 'авг.', 'сен.',  'окт.', 'ноя.', 'дек.'
]
export const MonthNameEng: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

import {ApiService, ErrorService, HttpClientService, Redis, TemplateService, UserRedis} from "../../../../src/services";
import {
    CityFromAction,
    CityToAction,
    DayAction,
    Message,
    MonthAction, SelectCityAction,
    WatchAction, WatchDateAction,
    WatchFindAction
} from "../../../../src/bot";
import {MONTH_ACTION} from "../../../../src/bot/month/consts";
import {ACTION_DAY} from "../../../../src/bot/day/consts";
import {IUserData} from "../../../../src/types";
import {SELECT_CITY} from "../../../../src/bot/select-city/consts";

describe('Валидация станций', () => {
    let redis: Redis;
    let userRedis: UserRedis;
    let templateService: TemplateService;
    let api: ApiService;
    let httpClient: HttpClientService;
    let errorService: ErrorService;
    let ctxMock: any;

    let cityFromAction: CityFromAction;
    let cityToAction:  CityToAction;
    let selectCityAction: SelectCityAction;
    let message: Message;
    let watchDate: WatchDateAction;
    let monthAction: MonthAction;
    let dayAction: DayAction;
    let watchAction: WatchAction;
    let watchFindAction:WatchFindAction;

    beforeEach(() => {
        redis = new Redis(`redis://bot-redis:6379`)
        userRedis = new UserRedis(redis);
        templateService = new TemplateService(userRedis);
        httpClient = new HttpClientService();
        api = new ApiService(httpClient);
        errorService = new ErrorService();

        watchAction = new WatchAction(userRedis);
        cityFromAction = new CityFromAction(userRedis);
        cityToAction = new CityToAction(userRedis);
        selectCityAction = new SelectCityAction(userRedis, watchAction);
        message = new Message(userRedis, templateService, api, errorService);
        watchDate = new WatchDateAction(userRedis);
        monthAction = new MonthAction(userRedis);
        dayAction = new DayAction(userRedis, watchAction);
        watchFindAction = new WatchFindAction(userRedis, templateService, api, errorService);
        ctxMock = {
            from: {id: 2},
            reply: jest.fn(),
            message: {},
            session: {
                messageIds: []
            },
            chat: {id: 3}
        }
    })

    it('должен проверять валидность станции отправления', async () => {
        let replySpyOn = jest.spyOn(ctxMock, 'reply').mockResolvedValue({message_id: 1});

        await cityFromAction.action(ctxMock);
        ctxMock.message.text = 'карталы'
        await message.action(ctxMock);
        let [_first1, citiesFrom] = replySpyOn.mock.lastCall as any
        ctxMock.match = new RegExp(SELECT_CITY).exec(citiesFrom.reply_markup.inline_keyboard[0][0].callback_data)
        await selectCityAction.action(ctxMock)

        await cityToAction.action(ctxMock);
        ctxMock.message.text = 'челябинск'
        await message.action(ctxMock);
        let [_first2, citiesTo] = replySpyOn.mock.lastCall as any
        ctxMock.match = new RegExp(SELECT_CITY).exec(citiesTo.reply_markup.inline_keyboard[0][0].callback_data)
        await selectCityAction.action(ctxMock)

        await watchDate.action(ctxMock);
        let [_first, last] = replySpyOn.mock.lastCall as any
        ctxMock.match = new RegExp(MONTH_ACTION).exec(last.reply_markup.inline_keyboard[0][0].callback_data)
        await monthAction.action(ctxMock);

        const [_first3, last2] = replySpyOn.mock.lastCall as any
        ctxMock.match = new RegExp(ACTION_DAY).exec(last2.reply_markup.inline_keyboard[0][0].callback_data)
        await dayAction.action(ctxMock);

        await watchFindAction.action(ctxMock);

        const userData = await userRedis.getData(ctxMock.from.id)
        console.log((replySpyOn.mock.lastCall as any)[1]);

        expect(userData).toEqual<IUserData>({
            selectedYear: 2025,
            selectedMonth: 9,
            selectedDay: 20,
            cities: [],
            currentSelectCity: undefined,
            cityFrom:  {
                entity_type_id: 2,
                id: 2040388,
                name: "Карталы-1",
                slug: "kartaly-1",
            },
            cityTo:  {
                entity_type_id: 2,
                id: 2040000,
                name: "Челябинск Главный",
                slug: "celiabinsk-glavnyi",
            },
        })
        // expect(isValidStation('Москва (Курский вокзал)')).toBe(true);
        // expect(isValidStation('Несуществующая станция')).toBe(false);
        // expect(isValidStation('')).toBe(false);
    });
})

import {ApiService, ErrorService, HttpClientService, Redis, TemplateService, UserRedis} from "../../services";
import {WatchFindAction} from "./watch-find.action";

const mockRedisClient = {
    connect: jest.fn(),
    on: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
    isOpen: true,
};

jest.mock('redis', () => ({
    createClient: jest.fn(() => mockRedisClient),
}));

describe('class WatchFindAction', () => {
    let watchFindAction: WatchFindAction;
    let redis: Redis;
    let userRedis: UserRedis;
    let ctxMock:any;
    let templateService:TemplateService;
    let apiService: ApiService;
    let errorService: ErrorService;
    // let inlineKeyboard: InlineKeyboard;
    // let now: Date = new Date();
    let mockCity = {
        id: 1,
        name: "карталы",
        slug: 'kartaly',
        entity_type_id: 2
    }

    beforeEach(() => {
        redis = new Redis();
        userRedis = new UserRedis(redis)
        const httpClientService = new HttpClientService();
        errorService = new ErrorService()
        apiService = new ApiService(httpClientService);
        templateService = new TemplateService(userRedis);
        watchFindAction = new WatchFindAction(userRedis, templateService, apiService, errorService)
        ctxMock = {
            from: {id: 123},
            message: {text: 'Карталы'},
            reply: jest.fn()
        }

        // inlineKeyboard = new InlineKeyboard()
        // now = new Date();
        jest.clearAllMocks();
    });

    it('async .filterTrains() когда нету: cityFrom', async () => {
        const fetchSpy = jest.spyOn(global, 'fetch');
        const noDepartureCitySpy = jest.spyOn(templateService, 'noDepartureCity');
        const noArrivalCitySpy = jest.spyOn(templateService, 'noArrivalCity');
        const serverErrorSpy = jest.spyOn(errorService, 'serverError');

        const userData = await userRedis.getData(ctxMock.from.id);
        userData.cityTo = mockCity;
        userData.cities = [mockCity];
        const result = await watchFindAction.filterTrains(userData);

        expect(noDepartureCitySpy).toHaveBeenCalled();
        expect(noArrivalCitySpy).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(serverErrorSpy).not.toHaveBeenCalled();
        expect(result).toBe(templateService.noDepartureCity())
        expect(result).toBe(templateService.noDepartureCity())
        expect(userData.cities).toEqual([])
    })

    it('async .filterTrains() когда нету: cityTo', async () => {
        const fetchSpy = jest.spyOn(global, 'fetch');
        const noDepartureCitySpy = jest.spyOn(templateService, 'noDepartureCity');
        const noArrivalCitySpy = jest.spyOn(templateService, 'noArrivalCity');
        const serverErrorSpy = jest.spyOn(errorService, 'serverError');

        const userData = await userRedis.getData(ctxMock.from.id);
        userData.cityFrom = mockCity;
        userData.cities = [mockCity];
        const result = await watchFindAction.filterTrains(userData);

        expect(noDepartureCitySpy).not.toHaveBeenCalled();
        expect(noArrivalCitySpy).toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(serverErrorSpy).not.toHaveBeenCalled();
        expect(result).toBe(templateService.noArrivalCity())
        expect(userData.cities).toEqual([])
    })
})
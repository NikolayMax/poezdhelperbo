import { Message } from './message';
import { ApiService, ErrorService, HttpClientService, Redis, TemplateService, UserRedis } from '../../services';
import { mockCities, mockResponse } from './message.mock';
import { InlineKeyboard } from 'grammy';

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

describe('class Message', () => {
	let messageClass: Message;
	let redis: Redis;
	let userRedis: UserRedis;
	let ctxMock: any;
	let templateService: TemplateService;
	let apiService: ApiService;
	let errorService: ErrorService;
	let inlineKeyboard: InlineKeyboard;
	let now: Date = new Date();

	beforeEach(() => {
		redis = new Redis('');
		userRedis = new UserRedis(redis);
		const httpClientService = new HttpClientService();
		errorService = new ErrorService();
		apiService = new ApiService(httpClientService);
		templateService = new TemplateService(userRedis);
		messageClass = new Message(userRedis, templateService, apiService, errorService);
		ctxMock = {
			from: { id: 123 },
			message: { text: 'Карталы' },
			reply: jest.fn(),
		};

		inlineKeyboard = new InlineKeyboard();
		now = new Date();
		jest.clearAllMocks();
	});

	it('async .action() если города найдены', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse(mockCities));
		const serverErrorSpy = jest.spyOn(errorService, 'serverError');
		const timeoutErrorSpy = jest.spyOn(errorService, 'timeoutError');
		const getDataSpy = jest.spyOn(userRedis, 'getData');
		const setDataSpy = jest.spyOn(userRedis, 'setData');

		await messageClass.action(ctxMock);

		expect(fetchSpy).toHaveBeenCalled();
		expect(serverErrorSpy).not.toHaveBeenCalled();
		expect(timeoutErrorSpy).not.toHaveBeenCalled();
		expect(getDataSpy).toHaveBeenCalledWith(ctxMock.from.id);
		expect(setDataSpy).toHaveBeenCalledWith(ctxMock.from.id, {
			cities: mockCities,
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		});
		mockCities.forEach((city) => {
			inlineKeyboard.text(city.name, `select-city:${city.slug}`);
		});
		expect(ctxMock.reply).toHaveBeenCalledWith('✅ Найдено несколько станций:', { reply_markup: inlineKeyboard });
	});

	it('async .action() если города не найдены', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse([]));
		const serverErrorSpy = jest.spyOn(errorService, 'serverError');
		const timeoutErrorSpy = jest.spyOn(errorService, 'timeoutError');
		const getDataSpy = jest.spyOn(userRedis, 'getData');
		const setDataSpy = jest.spyOn(userRedis, 'setData');

		await messageClass.action(ctxMock);

		expect(fetchSpy).toHaveBeenCalled();
		expect(serverErrorSpy).not.toHaveBeenCalled();
		expect(timeoutErrorSpy).not.toHaveBeenCalled();
		expect(getDataSpy).toHaveBeenCalledWith(ctxMock.from.id);
		expect(setDataSpy).toHaveBeenCalledWith(ctxMock.from.id, {
			cities: [],
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		});

		expect(ctxMock.reply).toHaveBeenCalledWith(templateService.messageCityNotFound(ctxMock.message.text));
	});

	it('async .action() когда запрос выполнился с ошибкой', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse([], { shouldFail: true }));
		const serverErrorSpy = jest.spyOn(errorService, 'serverError');
		const timeoutErrorSpy = jest.spyOn(errorService, 'timeoutError');
		const getDataSpy = jest.spyOn(userRedis, 'getData');
		const setDataSpy = jest.spyOn(userRedis, 'setData');

		await messageClass.action(ctxMock);

		expect(fetchSpy).toHaveBeenCalled();
		expect(serverErrorSpy).toHaveBeenCalled();
		expect(timeoutErrorSpy).not.toHaveBeenCalled();
		expect(getDataSpy).toHaveBeenCalledWith(ctxMock.from.id);
		expect(setDataSpy).toHaveBeenCalledWith(ctxMock.from.id, {
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		});

		expect(ctxMock.reply).toHaveBeenCalledWith(errorService.serverError());
	});

	it('async .action() когда запрос выполнился долго', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse([], { delay: 6000 }));
		const serverErrorSpy = jest.spyOn(errorService, 'serverError');
		const timeoutErrorSpy = jest.spyOn(errorService, 'timeoutError');
		const getDataSpy = jest.spyOn(userRedis, 'getData');
		const setDataSpy = jest.spyOn(userRedis, 'setData');

		await messageClass.action(ctxMock);

		expect(fetchSpy).toHaveBeenCalled();
		expect(serverErrorSpy).not.toHaveBeenCalled();
		expect(timeoutErrorSpy).toHaveBeenCalled();
		expect(getDataSpy).toHaveBeenCalledWith(ctxMock.from.id);
		expect(setDataSpy).toHaveBeenCalledWith(ctxMock.from.id, {
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		});

		expect(ctxMock.reply).toHaveBeenCalledWith(errorService.timeoutError());
	}, 7000);
});

import { ApiService, HttpClientService } from '../../../src/services';

describe('class ApiService (Челябинская область) Ласточка Челябинск-Магнитогорск(7905)', () => {
	let api: ApiService;
	let httpClientService: HttpClientService;
	let mockRoutes = ['Челябинск', 'Троицк', 'Тамерлан', 'Карталы', 'Магнитогорск'];

	beforeEach(() => {
		httpClientService = new HttpClientService();
		api = new ApiService(httpClientService);
	});

	mockRoutes.forEach((routeName) => {
		it(`.searchStation(${routeName}) найти станцию`, async () => {
			const { data } = await api.searchStation(routeName);
			expect(data?.data.length).toBeGreaterThan(0);
		});
	});
});

describe('class ApiService (Челябинская область) Ласточка Челябинск-Екатеринбург', () => {
	let api: ApiService;
	let httpClientService: HttpClientService;
	let mockRoutes = [
		'Челябинск',
		'МУСЛЮМОВО',
		'НИЖНЯЯ',
		'КАМЕНСК-УРАЛЬСКИЙ',
		'ОП СОЦГОРОД',
		'ХРАМЦОВСКАЯ',
		'АРАМИЛЬ',
		'КОЛЬЦОВО',
		'ОП Компрессорный завод',
		'ШАРТАШ',
		'ПЕРВОМАЙСКАЯ',
		'ЕКАТЕРИНБУРГ',
	];

	beforeEach(() => {
		httpClientService = new HttpClientService();
		api = new ApiService(httpClientService);
	});

	mockRoutes.forEach((routeName) => {
		it(`.searchStation(${routeName}) найти станцию`, async () => {
			const { data } = await api.searchStation(routeName);
			expect(data?.data.length).toBeGreaterThan(0);
		});
	});
});

describe('class ApiService (Челябинская область) Ласточка Екатеринбург-Челябинск(7026/7006)', () => {
	let api: ApiService;
	let httpClientService: HttpClientService;
	let mockRoutes = [
		'ЕКАТЕРИНБУРГ',
		'ПЕРВОМАЙСКАЯ',
		'БОТАНИЧЕСКАЯ',
		'ВЕРХНИЙ УФАЛЕЙ',
		'КЫШТЫМ',
		'АРГАЯШ',
		'ОП 236 КМ',
		'ЧЕЛЯБИНСК ',
	];

	beforeEach(() => {
		httpClientService = new HttpClientService();
		api = new ApiService(httpClientService);
	});

	mockRoutes.forEach((routeName) => {
		it(`.searchStation(${routeName}) найти станцию`, async () => {
			const { data } = await api.searchStation(routeName);
			expect(data?.data.length).toBeGreaterThan(0);
		});
	});
});
describe('class ApiService (Челябинская область) Ласточка Челябинск - Екатеринбург(7007/7027) отп. 13:42', () => {
	let api: ApiService;
	let httpClientService: HttpClientService;
	let mockRoutes = [
		'ЧЕЛЯБИНСК',
		'ОП 236 КМ',
		'АРГАЯШ',
		'КЫШТЫМ',
		'ВЕРХНИЙ УФАЛЕЙ',
		'БОТАНИЧЕСКАЯ',
		'ПЕРВОМАЙСКАЯ',
		'ЕКАТЕРИНБУРГ',
	];

	beforeEach(() => {
		httpClientService = new HttpClientService();
		api = new ApiService(httpClientService);
	});

	mockRoutes.forEach((routeName) => {
		it(`.searchStation(${routeName}) найти станцию`, async () => {
			const { data } = await api.searchStation(routeName);
			expect(data?.data.length).toBeGreaterThan(0);
		});
	});
});

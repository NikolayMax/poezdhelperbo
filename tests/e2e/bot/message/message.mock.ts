import { ICity } from '../../../../src/types';

export interface MockConfig {
	delay?: number; // Задержка ответа в ms
	shouldFail?: boolean; // Имитировать ошибку
	failMessage?: string; // Сообщение ошибки
}
type ResponseMock = { ok: boolean; status: number; json: () => Promise<{ data: ICity[] }> };
export const mockCities: ICity[] = [
	{
		id: 1,
		name: 'карталы',
		slug: 'kartaly',
		entity_type_id: 2,
	},
	{
		id: 2,
		name: 'карталы 2',
		slug: 'kartaly2',
		entity_type_id: 6,
	},
];
export const mockResponse = async (mockCities: ICity[], config: MockConfig = {}) => {
	const response: ResponseMock = {
		ok: true,
		status: 200,
		json: async () => ({ data: mockCities }),
	};
	if (config.delay) {
		await new Promise((res) =>
			setTimeout(() => {
				response.ok = false;
				response.status = 400;
				res(response);
			}, config.delay),
		);
	}

	if (config.shouldFail) {
		response.ok = false;
		response.status = 500;
		throw new Error(config.failMessage || 'Failed to fetch cities');
	}

	return response;
};

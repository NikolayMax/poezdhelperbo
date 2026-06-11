import { Redis } from '../../../src/services/redis.service';

jest.mock('ioredis');

describe('Redis Service', () => {
	let redis: Redis;
	const mockClient = {
		set: jest.fn(),
		get: jest.fn(),
		on: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(mockClient.set as jest.Mock).mockResolvedValue('OK');
		(mockClient.get as jest.Mock).mockResolvedValue(null);
		// @ts-expect-error - mocking internal client
		redis = new Redis('redis://localhost:6379');
		// @ts-expect-error - setting mock client
		redis.client = mockClient;
	});

	it('should set string value', async () => {
		await redis.set('key', 'value');
		expect(mockClient.set).toHaveBeenCalledWith('key', 'value');
	});

	it('should set object value as JSON', async () => {
		const obj = { test: 'data' };
		await redis.set('key', obj);
		expect(mockClient.set).toHaveBeenCalledWith('key', JSON.stringify(obj));
	});

	it('should get value', async () => {
		(mockClient.get as jest.Mock).mockResolvedValue('value');
		const result = await redis.get<string>('key');
		expect(result).toBe('value');
	});

	it('should parse JSON value', async () => {
		const obj = { test: 'data' };
		(mockClient.get as jest.Mock).mockResolvedValue(JSON.stringify(obj));
		const result = await redis.get<typeof obj>('key');
		expect(result).toEqual(obj);
	});
});

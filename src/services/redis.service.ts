import IORedis from 'ioredis';

export class Redis {
	private client: IORedis;

	constructor(REDIS_URL: string) {
		this.client = new IORedis(REDIS_URL || 'redis://redis:6379');
		this.client.on('error', (err) => console.log('Redis Client Error', err));
	}

	getClient() {
		return this.client;
	}

	async set<T extends string | object>(key: string, value: T) {
		// console.log(`REDIS.SET(${key}): `, JSON.stringify(value, null, 2));
		if (typeof value === 'object' && value !== null) {
			await this.client.set(key, JSON.stringify(value));
		} else {
			await this.client.set(key, value);
		}
	}

	async get<T extends string | object>(key: string): Promise<T | null> {
		const value = await this.client.get(key);

		if (!value) return null;

		try {
			// console.log(`REDIS.SET(${key}): `, JSON.stringify(JSON.parse(value), null, 2));
			return JSON.parse(value) as T;
		} catch (e) {
			console.log(e);
			return value as T;
		}
	}
}

import { createClient, RedisClientType } from 'redis';

export class Redis {
	private client: RedisClientType;

	constructor() {
		this.client = createClient({
			url: process.env.REDIS_URL || 'redis://redis:6379',
		});
		this.client.on('error', (err) => console.log('Redis Client Error', err));
		this.client.connect();
	}

	async set<T extends string | object>(key: string, value: T) {
		if (typeof value === 'object' && value !== null) {
			await this.client.set(key, JSON.stringify(value));
		} else {
			await this.client.set(key, value);
		}
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key);

		if (!value) return null;

		try {
			return JSON.parse(value) as T;
		} catch (e) {
			console.log(e);
			return value as T;
		}
	}
	destroy() {
		this.client.destroy();
	}
}

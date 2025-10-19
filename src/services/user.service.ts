import { Redis } from './redis.service';
import { IUserData } from '../types';

export class UserRedis {
	constructor(private readonly redis: Redis) {}

    initData(userId: number) {
		const now = new Date();
		const userData: IUserData = {
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		};
		return this.setData(userId, userData);
	}

	getKey(id: number): string {
		return `user:${id}`;
	}

	async getData(userId: number): Promise<IUserData> {
		const userData = await this.redis.get<IUserData>(this.getKey(userId));

		if (!userData) {
			return this.initData(userId);
		}
		return userData;
	}

	async setData(userId: number, value: IUserData): Promise<IUserData> {
		await this.redis.set(this.getKey(userId), value);
		return value;
	}
}

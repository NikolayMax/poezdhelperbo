import { Redis } from './redis.service';
import { IUserData, IUserSchedule, TKeyRoute } from '../types';

export class UserRedis {
	constructor(private readonly redis: Redis) {}

	private initData(userId: number) {
		const now = new Date();
		const userData: IUserData = {
			messageIds: [],
			activeSchedules: [],
			cities: [],
			selectedDay: now.getDate(),
			selectedMonth: now.getMonth(),
			selectedYear: now.getFullYear(),
		};
		return this.setData(userId, userData);
	}

	private getKey(id: number): string {
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

	async addUserSchedule(userId: number, userSchedule: IUserSchedule): Promise<void> {
		const user = await this.getData(userId);
		user.activeSchedules = user.activeSchedules.filter((s) => s.routeId !== userSchedule.routeId);
		user.activeSchedules.push(userSchedule);

		await this.setData(userId, user);
	}

	async removeUserSchedule(userId: number, routeId: TKeyRoute): Promise<void> {
		const user = await this.getData(userId);
		user.activeSchedules = user.activeSchedules.filter((s) => s.routeId !== routeId);
		await this.setData(userId, user);
	}
}

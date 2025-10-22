import { Redis } from './redis.service';
import { ITrainSchedule } from '../types';

export class TrainService {
	constructor(private readonly redis: Redis) {}

	getKey(userId: number): `trains:${number}` {
		return `trains:${userId}`;
	}

	async setTrains(userId: number, trains: ITrainSchedule[]) {
		await this.redis.set<ITrainSchedule[]>(this.getKey(userId), trains);
	}

	async getTrains(userId: number) {
		return (await this.redis.get<ITrainSchedule[]>(this.getKey(userId))) || [];
	}
}

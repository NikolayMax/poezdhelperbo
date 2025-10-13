import { createClient, RedisClientType } from "redis";
import { IUserData } from "./types/session";

class Redis {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379'
        });
        this.client.on("error", (err) => console.log("Redis Client Error", err));
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

        if (!value)
            return null;

        try {
            return JSON.parse(value) as T
        } catch (e) {
            console.log(e);
            return value as T;
        }
    }
    destroy() {
        this.client.destroy();
    }
}
class UserRedis extends Redis {

    initData(userId: number) {
        const now = new Date()
        const userData: IUserData = {
            selectedDay: now.getDate(),
            selectedMonth: now.getMonth(),
            selectedYear: now.getFullYear()
        }
        return this.setData(userId, userData);
    }

    getKey(id: number): string {
        return `user:${id}`;
    }

    async getData(userId: number): Promise<IUserData> {
        const userData = await super.get<IUserData>(this.getKey(userId));

        if (!userData) {
            return this.initData(userId)

        }
        return userData;
    }

    async setData(userId: number, value: IUserData): Promise<IUserData> {
        await super.set(this.getKey(userId), value);
        return value
    }
}
export const userRedis = new UserRedis();

import { createClient, RedisClientType } from 'redis';
import type { IUserData } from './types';

const DEFAULT_USER_DATA: IUserData = {
  cities: [],
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),
  selectedDay: new Date().getDate(),
};

let client: RedisClientType;

async function getClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('[REDIS]', err));
    await client.connect();
  }
  return client;
}

export const userRedis = {
  async getData(userId: number): Promise<IUserData> {
    try {
      const c = await getClient();
      const raw = await c.get(`user:${userId}`);
      if (!raw) return { ...DEFAULT_USER_DATA };
      return JSON.parse(raw) as IUserData;
    } catch (err: any) {
      console.error(`[REDIS] getData error userId=${userId}:`, err?.message ?? err);
      return { ...DEFAULT_USER_DATA };
    }
  },

  async setData(userId: number, data: IUserData): Promise<void> {
    try {
      const c = await getClient();
      await c.set(`user:${userId}`, JSON.stringify(data));
    } catch (err: any) {
      console.error(`[REDIS] setData error userId=${userId}:`, err?.message ?? err);
    }
  },
};

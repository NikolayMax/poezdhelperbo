import {Redis} from "../../../src/services";
import {IUserData} from "../../../src/types";

describe('Redis Integration', () => {
    let redis: Redis;
    let ctxMock = {
        from: {id: 12}
    }
    beforeEach(() => {
        redis = new Redis(`redis://bot-redis:6379`)
    })
    afterEach(async () => {
        await redis.flushAll()
    });
    afterAll(async () => {
        redis.destroy();
    });
    it('.get() .set() должен сохранять и получать данные пользователя', async () => {
        const id = `user:${ctxMock.from.id}`;
        const mockUserData: IUserData = {
            cities: [],
            selectedYear: 2017,
            selectedDay: 1,
            selectedMonth:1
        }
        let userData = await redis.get<IUserData>(id);
        expect(userData).toBe(null);
        await redis.set<IUserData>(id, mockUserData)
        userData = await redis.get<IUserData>(id);
        expect(userData).toEqual(mockUserData);
    })
})
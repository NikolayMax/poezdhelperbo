import {Redis, UserRedis} from "../../../src/services";
import {IUserData} from "../../../src/types";

describe('UserRedis Integration', () => {
    let redis: Redis;
    let userRedis: UserRedis
    let ctxMock = {
        from: {id: 12}
    }
    beforeEach(() => {
        redis = new Redis(`redis://bot-redis:6379`)
        userRedis = new UserRedis(redis);
    })
    afterEach(async () => {
        await redis.flushAll()
    });
    afterAll(async () => {
        redis.destroy();
    });
    it('.get() .set() должен сохранять и получать данные пользователя', async () => {
        const {id} = ctxMock.from;
        const now = new Date()
        const mockUserData: IUserData = {
            cities: [],
            selectedYear: now.getFullYear(),
            selectedDay: now.getDate(),
            selectedMonth: now.getMonth()
        }
        let userData = await userRedis.getData(id);
        expect(userData).toEqual(mockUserData);
        mockUserData.cityFrom = {
            id: 1,
                name: "kartaly",
                slug: "kartaly",
                entity_type_id: 34
        }
        await userRedis.setData(id, mockUserData)
        userData = await userRedis.getData(id);
        expect(userData).toEqual(mockUserData);
    })
})
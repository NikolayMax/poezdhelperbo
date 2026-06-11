import { config } from 'dotenv';
import { BotTelegram } from './bot/bot';
import { UserRedis, TemplateService, ApiService, ErrorService, HttpClientService } from './services';
import { Redis } from './services';
import { BotContext } from './types';
import { Bot } from 'grammy';
import { ScheduleService, MiddlewareService, TrainService } from './services';

class App {
	botTelegram: BotTelegram | undefined;

	constructor() {
		const { parsed } = config();

		if (!parsed) {
			console.error('Error: .env file not found');
			return;
		}
		if (parsed && !('TELEGRAM_KEY' in parsed)) {
			console.error('Error: TELEGRAM_KEY is not defined in .env');
			return;
		}
		if (!parsed.TELEGRAM_KEY) {
			console.error('Error: TELEGRAM_KEY is empty');
			return;
		}
		if (!parsed.REDIS_URL) {
			console.error('Error: REDIS_URL is not defined in .env');
			return;
		}

		const bot = new Bot<BotContext>(parsed.TELEGRAM_KEY);
		const redis = new Redis(parsed.REDIS_URL);
		const trainService = new TrainService(redis);
		const userRedis = new UserRedis(redis);
		const templateService = new TemplateService(userRedis);
		const errorService = new ErrorService();
		const httpClientService = new HttpClientService();
		const api = new ApiService(httpClientService);
		const scheduleService = new ScheduleService(bot, redis, userRedis, api);
		const middleware = new MiddlewareService(userRedis);

		this.botTelegram = new BotTelegram(
			bot,
			redis,
			userRedis,
			templateService,
			api,
			errorService,
			scheduleService,
			middleware,
			trainService,
		);
	}
}
new App();

import { config } from 'dotenv';
import { BotTelegram } from './bot/bot';
import { UserRedis, TemplateService, ApiService, ErrorService, HttpClientService } from './services';
import {Redis} from "./services";

class App {
	botTelegram: BotTelegram | undefined;

	constructor() {
		const { parsed } = config();

		if (!parsed) {
			return;
		}
		if (parsed && !('TELEGRAM_KEY' in parsed)) {
			return;
		}
		if (!parsed.TELEGRAM_KEY) {
			return;
		}

        const redis = new Redis()
		const userRedis = new UserRedis(redis);
		const templateService = new TemplateService(userRedis);
        const errorService = new ErrorService()
        const httpClientService = new HttpClientService()
		const api = new ApiService(httpClientService);

		this.botTelegram = new BotTelegram(parsed.TELEGRAM_KEY, userRedis, templateService, api, errorService);
	}
}

new App();

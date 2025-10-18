import { config } from 'dotenv';
import { BotTelegram } from './bot/bot';
import { TemplateService } from './services/message-template.service';
import { UserRedis } from './services/user.service';
import { ApiService } from './services/api.service';

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

		const userRedis = new UserRedis();
		const templateService = new TemplateService(userRedis);
		const api = new ApiService();

		this.botTelegram = new BotTelegram(parsed.TELEGRAM_KEY, userRedis, templateService, api);
	}
}

new App();

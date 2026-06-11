import { Bot, session } from 'grammy';
import { RedisAdapter } from '@grammyjs/storage-redis';
import {
	StartCommand,
	StartAction,
	WatchAction,
	WatchDateAction,
	CityFromAction,
	CityToAction,
	WatchFindAction,
	SelectCityAction,
	CalendarAction,
	Message,
	WatchPlaceAction,
	WatchActiveAction,
	WatchCancelAction,
} from './';
import { ActionRegistry, CommandRegistry } from '../decorator';
import {
	UserRedis,
	TemplateService,
	ApiService,
	ErrorService,
	Redis,
	ScheduleService,
	MiddlewareService,
	TrainService,
} from '../services';
import { BotContext, SessionData } from '../types';

export class BotTelegram {
	constructor(
		private readonly bot: Bot<BotContext>,
		private readonly redis: Redis,
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly api: ApiService,
		private readonly errorService: ErrorService,
		private readonly scheduleService: ScheduleService,
		private readonly middleware: MiddlewareService,
		private readonly trainService: TrainService,
	) {
		const storage = new RedisAdapter({
			instance: this.redis.getClient(),
		});
		this.bot.use(
			session({
				initial: this.initial,
				storage,
				getSessionKey: (ctx) => {
					// Ключом будет ID пользователя
					return ctx.from?.id.toString();
				},
			}),
		);
		this.bot.use(this.middleware.action.bind(this.middleware));

		const watchAction = new WatchAction(this.userRedis);
		new WatchDateAction(this.userRedis);
		new CityFromAction(this.userRedis);
		new CityToAction(this.userRedis);
		new CalendarAction(this.userRedis, watchAction);
		new WatchPlaceAction(this.userRedis, this.templateService, this.scheduleService, this.trainService);
		new WatchFindAction(this.userRedis, this.templateService, this.api, this.errorService, this.trainService);
		const startAction = new StartAction();
		new StartCommand(startAction);
		new SelectCityAction(this.userRedis, watchAction);
		const message = new Message(this.userRedis, this.templateService, this.api, this.errorService);
		new WatchActiveAction(this.userRedis, this.scheduleService);
		new WatchCancelAction(this.userRedis, this.scheduleService);

		ActionRegistry.setupBot(this.bot);
		CommandRegistry.setupBot(this.bot);

		this.bot.on('message:text', message.action.bind(message));
		this.bot.catch((err) => {
			console.error('Bot error:', err.message || err);
		});

		this.bot
			.start()
			.then(() => console.log('START LISTEN APP'))
			.catch((e) => console.error(e));

		scheduleService.startScheduler();
	}

	initial(): SessionData {
		return { messageIds: [] };
	}
}

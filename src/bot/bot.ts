import { Bot, session, NextFunction } from 'grammy';
import {
	StartCommand,
	StartAction,
	WatchAction,
	WatchDateAction,
	CityFromAction,
	CityToAction,
	WatchFindAction,
	MonthAction,
	SelectCityAction,
	DayAction,
	Message,
	WatchPlaceAction,
} from './';
import { ActionRegistry } from '../decorator/action.decorator';
import { CommandRegistry } from '../decorator/command.decorator';
import { UserRedis } from '../services/user.service';
import { TemplateService } from '../services/message-template.service';
import { BotContext, SessionData } from '../types/bot.interface';
import { ApiService } from '../services/api.service';

function initial(): SessionData {
	return { messageIds: [] };
}

export class BotTelegram {
	private readonly bot: Bot<BotContext> | undefined;

	constructor(
		TELEGRAM_KEY: string | undefined,
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
		private readonly api: ApiService,
	) {
		if (!TELEGRAM_KEY) {
			console.error('TELEGRAM_KEY: not found');
			return;
		}

		this.bot = new Bot<BotContext>(TELEGRAM_KEY);
		this.bot.use(session({ initial }));
		this.bot.use(this.middleware);

		new WatchDateAction(this.userRedis);
		new CityFromAction(this.userRedis);
		new CityToAction(this.userRedis, this.templateService);
		new MonthAction(this.userRedis);
		new WatchPlaceAction(this.userRedis, this.templateService, this.api);
		new WatchFindAction(this.userRedis, this.templateService, this.api);
		const watchAction = new WatchAction(this.userRedis);
		const startAction = new StartAction();
		new StartCommand(startAction);
		new DayAction(this.userRedis, watchAction);
		new SelectCityAction(this.userRedis, watchAction);
		const message = new Message(this.userRedis, this.templateService);

		ActionRegistry.setupBot(this.bot);
		CommandRegistry.setupBot(this.bot);

		this.bot.on('message:text', message.action.bind(message));
		this.bot
			.start()
			.then(() => console.log('START LISTEN APP'))
			.catch((e) => console.error(e));
	}

	middleware(ctx: BotContext, next: NextFunction) {
		if (ctx.session.messageIds.length > 0 && ctx.chat?.id) {
			let messageId;
			while ((messageId = ctx.session.messageIds.pop())) {
				ctx.api.deleteMessage(ctx.chat?.id, messageId);
			}
		} else {
			try {
				ctx.deleteMessage();
			} catch (e) {
				console.log(e);
			}
		}
		return next();
	}
}

import { config } from 'dotenv';
import { Telegraf } from 'telegraf';
import { ActionRegistry } from '../decorator/action.decorator';
import './balance/balance.action';
import './city-from/city-from.action';
import './city-to/city-to.action';
import './day/day.action';
import './month/month.action';
import './select-city/select-city.action';
import './watch/watch.action';
import './watch-find/watch-find.action';
import './watch-date/watch-date.action';
import './watch-place/watch-place.action';
import './start/start.command';
import './start/start.action';
import './balance/balance.action';
import messageAction from './message/message';
import { CommandRegistry } from '../decorator/command.decorator';

export const init = async () => {
	const { error, parsed } = config();

	if (error) {
		throw new Error('Error parse .env');
	}

	if (!parsed) {
		throw new Error('Config .env is empty');
	}

	if (!('TELEGRAM_KEY' in parsed)) {
		throw new Error('TELEGRAM_KEY not found');
	}

	const bot = new Telegraf(parsed.TELEGRAM_KEY);

	bot.on('callback_query', async (ctx, next) => {
		await ctx.answerCbQuery();
		return next();
	});

	ActionRegistry.setupBot(bot);
	CommandRegistry.setupBot(bot);
	messageAction(bot);

	bot.launch();
};

import { Bot } from 'grammy';
import { BotContext } from '../types';

export class CommandRegistry {
	private static commands: Map<string, (ctx: BotContext) => void> = new Map();

	static register(action: string, handler: (ctx: BotContext) => void) {
		this.commands.set(action, handler);
	}

	static setupBot = (bot: Bot<BotContext>) => {
		this.commands.forEach((handler, action) => {
			bot.command(action, handler);
		});
	};
}

export function Command(actionName: string) {
	return function <This, Return>(
		_target: (this: This, ctx: BotContext) => Return,
		context: ClassMethodDecoratorContext<This, (ctx: BotContext) => void>,
	) {
		context.addInitializer(function (this: This) {
			// this здесь - экземпляр класса
			const method = this[context.name as keyof This] as (ctx: BotContext) => void;
			if (typeof method === 'function') {
				CommandRegistry.register(actionName, method.bind(this));
			}
		});
	};
}

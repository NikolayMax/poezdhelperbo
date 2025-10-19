import { Bot } from 'grammy';
import { ActionContext, BotContext } from '../types';

export class ActionRegistry {
	private static actions: Map<string | RegExp, (ctx: ActionContext) => void> = new Map();

	static register(action: string | RegExp, handler: (ctx: ActionContext) => void) {
		this.actions.set(action, handler);
	}

	static setupBot(bot: Bot<BotContext>) {
		this.actions.forEach((handler, action) => {
			bot.callbackQuery(action, handler);
		});
	}
}

export function Action(actionName: string | RegExp) {
    return function <This, Return>(
		_target: (this: This, ctx: ActionContext) => Return,
		context: ClassMethodDecoratorContext<This, (ctx: ActionContext) => void>,
	) {
		context.addInitializer(function (this: This) {
			const method = this[context.name as keyof This] as (ctx: ActionContext) => void;
			if (typeof method === 'function') {
				ActionRegistry.register(actionName, method.bind(this));
			}
		});
	};
}

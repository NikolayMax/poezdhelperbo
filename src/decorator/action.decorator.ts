import { Context, Telegraf } from 'telegraf';

export class ActionRegistry {
	private static actions: { action: string; handler: (ctx: Context) => void }[] = [];
	static register(action: string, handler: (ctx: Context) => void) {
		this.actions.push({ action, handler });
	}
	static setupBot(bot: Telegraf) {
		this.actions.forEach(({ action, handler }) => {
			bot.action(action, handler);
		});
	}
}
export function Action(actionName: string | RegExp) {
	return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
		ActionRegistry.register(actionName.toString(), target[propertyName].bind(target));
		return descriptor;
	};
}

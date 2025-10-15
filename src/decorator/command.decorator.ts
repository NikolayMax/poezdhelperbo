import { Context, Telegraf } from 'telegraf';

export class CommandRegistry {
	private static commands: { action: string; handler: (ctx: Context) => void }[] = [];
	static register(action: string, handler: (ctx: Context) => void) {
		this.commands.push({ action, handler });
	}
	static setupBot(bot: Telegraf) {
		this.commands.forEach(({ action, handler }) => {
			bot.command(action, handler);
		});
	}
}
export function Command(actionName: string) {
	return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
		CommandRegistry.register(actionName, target[propertyName].bind(target));
		return descriptor;
	};
}

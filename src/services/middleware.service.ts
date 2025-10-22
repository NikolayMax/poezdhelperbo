import { UserRedis } from './user.service';
import { BotContext } from '../types';
import { NextFunction } from 'grammy';

export class MiddlewareService {
	constructor(private readonly userRedis: UserRedis) {}

	async action(ctx: BotContext, next: NextFunction) {
		if (ctx.chat?.id) {
			const userData = await this.userRedis.getData(ctx.chat.id);
			if (!userData.chatId) {
				userData.chatId = ctx.chat.id;
			}
			let messageId;
			while ((messageId = userData.messageIds.pop())) {
				try {
					await ctx.api.deleteMessage(ctx.chat?.id, messageId);
				} catch (e) {
					console.log(e);
				}
			}
			await this.userRedis.setData(ctx.chat.id, userData);
		}

		if (ctx.session.messageIds.length > 0 && ctx.chat?.id) {
			let messageId;
			while ((messageId = ctx.session.messageIds.pop())) {
				try {
					await ctx.api.deleteMessage(ctx.chat?.id, messageId);
				} catch (e) {
					console.log(e);
				}
			}
		}

		return next();
	}
}

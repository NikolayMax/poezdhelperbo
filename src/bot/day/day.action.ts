import { WatchAction } from '../watch/watch.action';
import { UserRedis } from '../../services';
import { ACTION_DAY } from './consts';
import { Action } from '../../decorator';
import { ActionContext } from '../../types';

export class DayAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly watchAction: WatchAction,
	) { }

	@Action(new RegExp(ACTION_DAY))
	async action(ctx: ActionContext) {
		const userId = ctx.from!.id;
		const userData = await this.userRedis.getData(userId);

		userData.selectedDay = Number((ctx.match as string[])[1]);
		await this.userRedis.setData(userId, userData);

		const { text, reply_markup } = await this.watchAction.buttons(ctx);
		const message = await ctx.reply(text, { reply_markup });
		ctx.session.messageIds.push(message.message_id);
	}
}

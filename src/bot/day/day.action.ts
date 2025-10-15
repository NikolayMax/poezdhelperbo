import { Context } from 'telegraf';
import watchAction from '../watch/watch.action';
import { userRedis } from '../../services/user.service';
import { ACTION_DAY } from './consts';
import { Action } from '../../decorator/action.decorator';
import messageService from '../../services/message-template.service';

class DayAction {
	@Action(new RegExp(ACTION_DAY))
	async action(ctx: Context) {
		if (!ctx.from) {
			return ctx.reply(messageService.userDataError());
		}
		if (!('match' in ctx)) {
			return ctx.reply('Error: match not found in ctx');
		}
		const userId = ctx.from.id;
		const userData = await userRedis.getData(userId);

		userData.selectedDay = Number((ctx.match as RegExp[])[1]);
		await userRedis.setData(userId, userData);

		const { text, buttons } = await watchAction.buttons(ctx);
		ctx.reply(text, buttons);
	}
}
const actionDay = new DayAction();
export default actionDay;

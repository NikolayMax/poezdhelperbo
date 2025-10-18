import { UserRedis } from '../../services/user.service';
import { Action } from '../../decorator/action.decorator';
import { CITY_TO_ACTION } from './consts';
import { CurrentSelectCity } from '../select-city/consts';
import { TemplateService } from '../../services/message-template.service';
import { ActionContext } from '../../types/bot.interface';

export class CityToAction {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
	) {}

	@Action(CITY_TO_ACTION)
	async action(ctx: ActionContext) {
		const { text } = this.buttons();
		if (!ctx.from) {
			await ctx.reply(this.templateService.userDataError());
			return;
		}
		const userId = ctx.from.id;
		const userData = await this.userRedis.getData(userId);
		userData.currentSelectCity = CurrentSelectCity.To;
		await this.userRedis.setData(userId, userData);
		const enterCityToMessage = await ctx.reply(text);
		this.deleteMessage(ctx, enterCityToMessage);
	}

	deleteMessage(ctx: ActionContext, enterCityToMessage: any) {
		setTimeout(() => {
			if (!ctx.chat?.id) {
				return console.log('Error not found ctx.chat?.id');
			}
			ctx.api.deleteMessage(ctx.chat.id, enterCityToMessage.message_id).catch((error) => {
				console.log(error);
			});
		}, 3000);
	}

	buttons() {
		return {
			text: '🏙️ *Введите название города или станции:',
		};
	}
}

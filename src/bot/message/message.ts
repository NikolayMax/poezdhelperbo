import { InlineKeyboard, Context } from 'grammy';
import { UserRedis } from '../../services/user.service';
import { ICity } from '../../types/city.interface';
import { TemplateService } from '../../services/message-template.service';

export class Message {
	constructor(
		private readonly userRedis: UserRedis,
		private readonly templateService: TemplateService,
	) {}

	async action(ctx: Context) {
		const userId = ctx.from!.id;
		const userData = await this.userRedis.getData(userId);

		fetch(`https://api.svrpk.ru/api/v1/suggest/stations?name=${ctx.message?.text || ''}`)
			.then((response) => response.json())
			.then(async ({ data }: { data: ICity[] }) => {
				const inlineKeyboard = new InlineKeyboard();

				data.forEach((city) => {
					inlineKeyboard.text(city.name, `select-city:${city.slug}`);
				});
				userData.cities = data;
				await this.userRedis.setData(userId, userData);
				if (data.length < 1) {
					await ctx.reply(this.templateService.messageCityNotFound());
					return;
				}
				await ctx.reply('✅ Найдено несколько станций:', { reply_markup: inlineKeyboard });
			})
			.catch((error) => {
				console.log(error);
			});
	}
}

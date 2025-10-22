import { InlineKeyboard } from 'grammy';
import { UserRedis, TemplateService, ApiService, ErrorService } from '../../services';
import { BotContext, ErrorType } from "../../types";

export class Message {
    constructor(
        private readonly userRedis: UserRedis,
        private readonly templateService: TemplateService,
        private readonly api: ApiService,
        private readonly errorService: ErrorService
    ) { }

    async action(ctx: BotContext) {
        const userId = ctx.from!.id;
        const userData = await this.userRedis.getData(userId);
        const inlineKeyboard = new InlineKeyboard();

        const { data, success, error } = await this.api.searchStation(ctx.message!.text || '')

        if (!success) {

            let message;
            switch (error.type) {
                case ErrorType.SERVER_ERROR:
                    message = await ctx.reply(this.errorService.serverError());
                    break;
                case ErrorType.CLIENT_ERROR:
                    message = await ctx.reply(this.errorService.timeoutError());
                    break;
                default:
                    message = await ctx.reply(this.errorService.serverError());
            }
            ctx.session.messageIds.push(message.message_id);
            return;
        }

        data.data.forEach((city) => {
            inlineKeyboard.text(city.name, `select-city:${city.slug}`).row();
        });

        userData.cities = data.data;

        await this.userRedis.setData(userId, userData);

        if (data.data.length < 1) {
            const message = await ctx.reply(this.templateService.messageCityNotFound(ctx.message!.text || ''));
            ctx.session.messageIds.push(message.message_id);
            await ctx.deleteMessage();
            return;
        }

        await ctx.deleteMessage();
        const message = await ctx.reply('✅ Найдено несколько станций:', { reply_markup: inlineKeyboard });
        ctx.session.messageIds.push(message.message_id);
    }
}

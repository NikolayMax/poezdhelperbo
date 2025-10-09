import {Telegraf} from "telegraf";
import {BotContext} from "../types/context";
import {CommandsName, CurrentSelectCity} from "../consts";
import {Buttons} from "../command.button";
import {userRedis} from "../redis";

export const actionSelectCity = (bot: Telegraf<BotContext>) => {
    bot.action(new RegExp(CommandsName.SelectCity), async (ctx) => {
        const slug = ctx.match[1];
        const userId = ctx.from?.id;
        const userData = await userRedis.getData(userId);
        const currentCity = userData?.cities?.find((city) => city.slug === slug)

        if(userData.currentSelectCity === CurrentSelectCity.From) {
            userData.cityFrom = currentCity
        } else {
            userData.cityTo = currentCity
        }

        await userRedis.setData(userId, userData);

        const {text, buttons} = await Buttons[CommandsName.Watch](ctx)
        ctx.reply(text, buttons)
    });
}
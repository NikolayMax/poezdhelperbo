import {Telegraf} from "telegraf";
import {BotContext} from "../types/context";
import {Buttons} from "../command.button";
import {CommandsName} from "../consts";
import {userRedis} from "../redis";

const actionDay = (bot: Telegraf<BotContext>) => {
    bot.action(new RegExp(CommandsName.Day), async (ctx: any) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);

        userData.selectedDay = Number(ctx.match[1]);
        await userRedis.setData(userId, userData);

        const {text, buttons} = await Buttons[CommandsName.Watch](ctx);
        ctx.reply(text, buttons)
    })
}

export default actionDay;
import {CommandsName} from "../consts";
import { Telegraf} from "telegraf";
import {BotContext} from "../types/context";
import {Buttons} from "../command.button";
import {userRedis} from "../redis";

const actionMonth = (bot: Telegraf<BotContext>) => {
    bot.action(new RegExp(CommandsName.Month), async (ctx: any) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);
        userData.selectedMonth = Number(ctx.match[1]);
        await userRedis.setData(userId, userData);

        const {text, buttons} = await Buttons[CommandsName.Month](ctx)

        ctx.reply(text, buttons)
    })
}

export default actionMonth;
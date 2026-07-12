import { Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";

const actionMonth = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.Month), async (ctx) => {
        const userId = ctx.user!.user_id;
        const userData = await userRedis.getData(userId);
        userData.selectedMonth = Number(ctx.match![1]);
        await userRedis.setData(userId, userData);

        const {text, attachments} = await Buttons[CommandsName.Month](ctx)

        ctx.reply(text, { attachments })
    })
}

export default actionMonth;

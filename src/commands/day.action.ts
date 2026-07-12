import { Bot } from "@maxhub/max-bot-api";
import { Buttons } from "../command.button";
import { CommandsName } from "../consts";
import { userRedis } from "../redis";

const actionDay = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.Day), async (ctx) => {
        const userId = ctx.user!.user_id;
        const userData = await userRedis.getData(userId);

        userData.selectedDay = Number(ctx.match![1]);
        await userRedis.setData(userId, userData);

        const {text, attachments} = await Buttons[CommandsName.Watch](ctx);
        ctx.reply(text, { attachments })
    })
}

export default actionDay;

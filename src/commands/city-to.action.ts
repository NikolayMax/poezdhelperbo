import { Bot } from "@maxhub/max-bot-api";
import { CommandsName, CurrentSelectCity } from "../consts";
import { Buttons } from "../command.button";
import { userRedis } from "../redis";

const action = (bot: Bot) => {
    bot.action(CommandsName.CityTo, async (ctx) => {
        const {text} = await Buttons[CommandsName.CityTo]();
        const userId = ctx.user!.user_id;
        const userData = await userRedis.getData(userId);
        userData.currentSelectCity = CurrentSelectCity.To;
        await userRedis.setData(userId, userData);
        ctx.reply(text)
    })
}

export default action;

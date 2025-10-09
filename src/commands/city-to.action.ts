import {Telegraf} from "telegraf";
import {CommandsName, CurrentSelectCity} from "../consts";
import {Buttons} from "../command.button";
import {userRedis} from "../redis";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.CityTo, async (ctx) => {
        const {text} = Buttons[CommandsName.CityTo]();
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);
        userData.currentSelectCity = CurrentSelectCity.To;
        await userRedis.setData(userId, userData);
        ctx.reply(text)
    })
}

export default action;
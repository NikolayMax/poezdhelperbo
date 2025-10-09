import {Markup, Telegraf} from "telegraf";
import axios from "axios";
import {CommandsName} from "../consts";
import {Buttons} from "../command.button";
import {userRedis} from "../redis";

const action = (bot: Telegraf) => {
    bot.on('message', async (ctx: any) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);

        axios.get(`https://api.svrpk.ru/api/v1/suggest/stations?name=${ctx.message.text}`)
            .then(async ({data}) => {
                const cities = data.data.map((city: any) => {
                    return Markup.button.callback(city.name, `select-city:${city.slug}`)
                });
                userData.cities = data.data;
                await userRedis.setData(userId, userData);
                ctx.deleteMessage();
                const {text} = Buttons[CommandsName.Message]()
                ctx.reply(text, Markup.inlineKeyboard(cities, {columns: 1}));
            }).catch((error) => {
            console.log(error)
        });
    });
}
export default action;
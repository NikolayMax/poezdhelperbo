import { Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {Buttons} from "../command.button";

const action = (bot: Telegraf) => {
    bot.start((ctx) => {
        // ctx.deleteMessage()
        const {text, buttons} = Buttons[CommandsName.Start]();
        ctx.reply  (text, buttons)
    });
}
export default action;
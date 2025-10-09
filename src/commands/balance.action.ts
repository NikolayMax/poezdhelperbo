import {Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {Buttons} from "../command.button";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.Balance, (ctx) => {
        const {text, buttons} = Buttons[CommandsName.Balance]()
        ctx.reply(text, buttons);
    })
}
export default action;
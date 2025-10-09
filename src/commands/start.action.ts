import {Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {Buttons} from "../command.button";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.Start, (ctx) => {
        const {text, buttons} = Buttons[CommandsName.Start]();
        ctx.reply(text, buttons);
    });
}
export default action;
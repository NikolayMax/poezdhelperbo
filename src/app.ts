import {Telegraf } from "telegraf";
import {config} from "dotenv";
import {actions} from "./commands";
import {middleware} from "./middleware";

const init = async () => {
    const {error, parsed} = config();

    if(error) {
        throw new Error('Error parse .env');
    }

    if(!parsed) {
        throw new Error("Config .env is empty")
    }

    const bot = new Telegraf(parsed.TELEGRAM_KEY);

    bot.use(middleware);
    bot.on('callback_query', (ctx, next) => {
        ctx.answerCbQuery();
        return next()
    })

    for(const action of actions){
        action(bot);
    }
    bot.launch()
}
init()
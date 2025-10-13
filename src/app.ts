import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { actions } from "./commands";

const init = async () => {
    const { error, parsed } = config();

    if (error) {
        throw new Error('Error parse .env');
    }

    if (!parsed) {
        throw new Error("Config .env is empty")
    }

    if (!('TELEGRAM_KEY' in parsed)) {
        throw new Error('TELEGRAM_KEY not found')
    }

    const bot = new Telegraf(parsed.TELEGRAM_KEY);

    bot.on('callback_query', async (ctx, next) => {
        await ctx.answerCbQuery();
        return next()
    })

    for (const action of actions) {
        action(bot);
    }
    bot.launch()
}
init()

import {session, Telegraf } from "telegraf";
import {config} from "dotenv";
import {Command} from "./commands/command.class";
import {StartCommand} from "./commands/start.command";
import {BalanceAction} from "./commands/balance.action";
import {StartAction} from "./commands/start.action";
import {WatchAction} from "./commands/watch/watch.action";
import {WatchDateAction} from "./commands/watch/watch-date.action";
import {BotContext} from "./types/context";
import {CityFromAction} from "./commands/city-from.action";

class Bot {
    bot: Telegraf<BotContext>
    commands: Command[] = []

    constructor() {
        const {error, parsed} = config();

        if(error) {
            throw new Error('Error parse .env');
        }

        if(!parsed) {
            throw new Error("Config .env is empty")
        }

        this.bot = new Telegraf<BotContext>(parsed.TELEGRAM_KEY);
    }

    init(){
        this.bot.use(session())
        this.bot.use((ctx, next) => {
            if(!ctx.session)
                ctx.session = {};
            return next()
        });
        this.initCommands();


        this.bot.launch()
    }

    initCommands(){
        this.commands = [
            new StartCommand(this.bot),
            new BalanceAction(this.bot),
            new StartAction(this.bot),
            new WatchAction(this.bot),
            new WatchDateAction(this.bot),
            new CityFromAction(this.bot)
        ];

        for(const command of this.commands){
            command.handler();
        }
    }
}

const bot = new Bot()
bot.init()
import {Telegraf} from "telegraf";
import {config} from "dotenv";
import {Command} from "./commands/command.class";
import {StartCommand} from "./commands/start.command";

class Bot {
    bot: Telegraf
    commands: Command[] = []

    constructor() {
        const {error, parsed} = config();

        if(error) {
            throw new Error('Error parse .env');
        }

        if(!parsed) {
            throw new Error("Config .env is empty")
        }

        this.bot = new Telegraf(parsed.TELEGRAM_KEY);
    }

    init(){
        this.initCommands();
        this.bot.launch()
    }

    initCommands(){
        this.commands = [
            new StartCommand(this.bot)
        ];

        for(const command of this.commands){
            command.handler();
        }
    }
}
const bot = new Bot()

bot.init()
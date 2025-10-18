import {config} from 'dotenv'
import {BotTelegram} from "./bot/bot";

class App{
    botTelegram: BotTelegram | undefined;
    constructor() {
        const {parsed} = config()

        if(!parsed){
            return;
        }
        if(parsed && !('TELEGRAM_KEY' in parsed)){
            return;
        }
        if(!parsed.TELEGRAM_KEY){
            return;
        }
        this.botTelegram = new BotTelegram(parsed.TELEGRAM_KEY)
    }
}


new App()
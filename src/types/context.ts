import {Context} from "telegraf";
import {SessionData} from "./session";

export interface BotContext extends Context {
    session: SessionData;
}
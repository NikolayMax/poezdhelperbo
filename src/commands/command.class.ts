import {Telegraf} from "telegraf";
import {BotContext} from "../types/context";

export abstract class Command {
    constructor(public bot: Telegraf<BotContext>) {}

    abstract handler(): void
}
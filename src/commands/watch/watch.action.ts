import {Command} from "../command.class";
import {Markup, Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import {BotContext} from "../../types/context";

export class WatchAction extends Command{
    constructor(bot: Telegraf<BotContext>) {
        super(bot);
    }

    handler(): void {
        this.bot.action(CommandsName.Watch, (ctx) => {
            ctx.answerCbQuery();
            const now = new Date();
            ctx.session.selectedYear = now.getFullYear();
            ctx.session.selectedMonth = now.getMonth();
            ctx.session.selectedDay = now.getDate();

            ctx.editMessageText('Параметры поиска: ', Markup.inlineKeyboard([
                [Markup.button.callback(this.renderSelectDate(ctx), CommandsName.WatchDate)],
                [
                Markup.button.callback("Город откуда: ", CommandsName.CityFrom),
                Markup.button.callback("Город куда: ", CommandsName.CityTo),
                ],
                [
                Markup.button.callback("НАЙТИ", CommandsName.WatchFind),
                Markup.button.callback("Главное меню", CommandsName.Start)
            ]
            ]))
        })
    }

    renderSelectDate(ctx:any) {
        const isSelectedDate = this.isSelectedDate(ctx);
        const {selectedYear, selectedMonth,selectedDay} = ctx.session;

        return `${ isSelectedDate ? `✅ ${selectedDay.toString().padStart(2, '0')}.${selectedMonth.toString().padStart(2, '0')}.${selectedYear}` : ''} Выберите ${isSelectedDate ? 'другую' : ''} дату: `;
    }

    isSelectedDate(ctx:any){
        const {selectedYear, selectedMonth,selectedDay} = ctx.session;
        return selectedYear !== undefined &&
                selectedMonth !== undefined &&
                selectedDay !== undefined;
    }

}
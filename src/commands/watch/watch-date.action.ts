import { Markup, Telegraf} from "telegraf";
import {Command} from "../command.class";
import {CommandsName, MonthNameEng, MonthNameRus} from "../consts";
import {BotContext} from "../../types/context";

export class WatchDateAction extends Command{
    constructor(bot: Telegraf<BotContext>) {
        super(bot)
    }

    handler(): void {
        this.bot.action(CommandsName.WatchDate, (ctx) => {
            ctx.answerCbQuery();
            ctx.editMessageText('Введите месяц: ', this.renderMonths(ctx))
        })
    }

    renderMonths(ctx:any){
        const  months = [];

        for(let i = ctx.session.selectedMonth; i < 12; i++){
            months.push(Markup.button.callback(MonthNameRus[i], `${MonthNameEng[i]}`))
            this.bot.action(`${MonthNameEng[i]}`, this.actionMonth)
        }
        return Markup.inlineKeyboard(months, {columns: 4})
    }

    actionMonth = (ctx:any) => {
        ctx.answerCbQuery();
        ctx.session.selectedMonth = MonthNameEng.indexOf(ctx.update.callback_query.data);
        ctx.editMessageText('Введите день: ', this.renderDays(ctx))
    }

    renderDays(ctx:any){
        const days = [];
        const endDay = this.getLastDayOfMonth(ctx.session.selectedYear, ctx.session.selectedMonth);
        console.log(ctx.session, endDay)
        for(let i = ctx.session.selectedDay; i <= endDay; i++){
            days.push(Markup.button.callback(`${(i < 10 ? '0' : '') + i}`, `${i}`))
            this.bot.action(`${i}`, this.actionDay)
        }

        return Markup.inlineKeyboard(days, {columns: 6})
    }

    actionDay = (ctx: any) => {
        ctx.answerCbQuery();

        ctx.session.selectedDay = Number(ctx.update.callback_query.data);

        ctx.editMessageText('Параметры поиска: ', Markup.inlineKeyboard([
            [Markup.button.callback(this.renderSelectDate(ctx), CommandsName.WatchDate)],
            [Markup.button.callback( "Город откуда: ", CommandsName.WatchFrom),
            Markup.button.callback("Город куда: ", CommandsName.WatchTo),],
            [Markup.button.callback("НАЙТИ", CommandsName.WatchFind),
            Markup.button.callback("Главное меню", CommandsName.Start)]
        ]))
    }

    getLastDayOfMonth(year: number, month: number) {
        // month: 0-11 (0 = январь, 11 = декабрь)
        return (new Date(year, month + 1, 0)).getDate();
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
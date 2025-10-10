import {CommandsName, MonthNameRus} from "./consts";
import {Markup} from "telegraf";
import {getLastDayOfMonth, renderSelectDate, renderSelectFromCity, renderSelectToCity} from "./lib";
import {userRedis} from "./redis";
import {Context} from "node:vm";

export const Buttons = {
    [CommandsName.Start]: () => ({
        text: 'Привет! Тут ты сможешь оследить свой поезд или электричку',
        buttons: Markup.inlineKeyboard([
            Markup.button.callback("Начать поиск", CommandsName.Watch),
            Markup.button.callback("Баланс", CommandsName.Balance),
            Markup.button.callback("Помощь", CommandsName.Help)
        ])
    }),
    [CommandsName.Balance]: () => ({
        text: 'Ваш Баланс: 10 запросов',
        buttons: Markup.inlineKeyboard([
            Markup.button.callback("Главное меню", CommandsName.Start)
        ])
    }),
    [CommandsName.CityFrom]: () => ({
        text: 'Введите город откуда:',
    }),
    [CommandsName.CityTo]: () => ({
        text: 'Введите город куда:',
    }),
    [CommandsName.WatchDate]: async (ctx: Context)=> {
        const  months = [];
        const userId = ctx.from.id;
        const {selectedMonth} = await userRedis.getData(userId);

        for(let i = selectedMonth ? selectedMonth : 0 ; i < 12; i++){
            console.log(MonthNameRus[i])
            months.push(Markup.button.callback(MonthNameRus[i], `month:${i}`))
        }
        return {
            text: 'Выберите месяц: ',
            buttons: Markup.inlineKeyboard(months, {columns: 4})
        }
    },
    [CommandsName.Watch]: async (ctx: Context) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);

        return {
            text: 'Параметры поиска: ',
            buttons: Markup.inlineKeyboard([
                [Markup.button.callback(renderSelectDate(userData), CommandsName.WatchDate)],
                [Markup.button.callback(renderSelectFromCity(userData), CommandsName.CityFrom)],
                [Markup.button.callback(renderSelectToCity(userData), CommandsName.CityTo)],
                [Markup.button.callback("НАЙТИ", CommandsName.WatchFind)],
                [Markup.button.callback("Главное меню", CommandsName.Start)]
            ])
        }
    },
    [CommandsName.Month]: async (ctx: Context) => {
        const days = [];

        const now = new Date()

        const currentMonth = now.getMonth();
        const userId = ctx.from.id;
        const {selectedYear, selectedMonth, selectedDay} = await userRedis.getData(userId);
        const endDay = getLastDayOfMonth(selectedYear, selectedMonth);

        for(let i = currentMonth === selectedMonth? selectedDay : 1; i <= endDay; i++){
            days.push(Markup.button.callback(`${i}`, `day:${i}`))
        }

        return {
            text: 'Выберите день: ',
            buttons: Markup.inlineKeyboard(days, {columns: 7})
        }
    },
    [CommandsName.Message]: () => ({text: 'Выберите город:'}),
    [CommandsName.WatchFind]: () => {
        return {
            text: '',
            buttons: Markup.inlineKeyboard([], {columns: 7})
        }
    }
}
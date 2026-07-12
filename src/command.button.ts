import { Context, Keyboard } from "@maxhub/max-bot-api";
import type { AttachmentRequest } from "@maxhub/max-bot-api/types";
import { CommandsName, MonthNameRus, PACKAGES } from "./consts";
import { getLastDayOfMonth, renderSelectDate, renderSelectFromCity, renderSelectToCity } from "./lib";
import { userRedis } from "./redis";
import { getBalance, checkAndExpirePaid, getTotalAvailable } from "./balance";

type ButtonResult = { text: string; attachments?: AttachmentRequest[] };

export const Buttons = {
    [CommandsName.Start]: (): ButtonResult => ({
        text: 'Привет! Тут ты сможешь оследить свой поезд или электричку',
        attachments: [Keyboard.inlineKeyboard([
            [Keyboard.button.callback("Начать поиск", CommandsName.Watch)],
            [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
            [Keyboard.button.callback("Баланс", CommandsName.Balance)],
            [Keyboard.button.callback("Помощь", CommandsName.Help)]
        ])]
    }),
    [CommandsName.Balance]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx!.user!.user_id;
        checkAndExpirePaid(userId);
        const balance = getBalance(userId);
        const total = getTotalAvailable(userId);

        let text = `💳 Ваш баланс\n\n`;
        text += `▫️ Бесплатных запросов: ${balance.freeRequests}\n`;
        text += `▫️ Платных запросов: ${balance.paidRequestsRemaining}`;
        if (balance.paidRequestsExpiry) {
            const expiresAt = new Date(balance.paidRequestsExpiry);
            text += `\n   (до ${expiresAt.toLocaleDateString('ru-RU')})`;
        }
        text += `\n\nВсего доступно: ${total}`;

        return {
            text,
            attachments: [Keyboard.inlineKeyboard([
                [Keyboard.button.callback("Купить запросы", CommandsName.Buy)],
                [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
                [Keyboard.button.callback("Главное меню", CommandsName.Start)]
            ])]
        };
    },
    [CommandsName.CityFrom]: (): ButtonResult => ({
        text: 'Введите город откуда:',
    }),
    [CommandsName.CityTo]: (): ButtonResult => ({
        text: 'Введите город куда:',
    }),
    [CommandsName.WatchDate]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx!.user!.user_id;
        const {selectedMonth} = await userRedis.getData(userId);

        const monthRows = [];
        for(let i = selectedMonth ? selectedMonth : 0 ; i < 12; i++){
            monthRows.push([Keyboard.button.callback(MonthNameRus[i], `month:${i}`)])
        }
        return {
            text: 'Выберите месяц: ',
            attachments: [Keyboard.inlineKeyboard(monthRows)]
        }
    },
    [CommandsName.Watch]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx!.user!.user_id;
        const userData = await userRedis.getData(userId);

        return {
            text: 'Параметры поиска: ',
            attachments: [Keyboard.inlineKeyboard([
                [Keyboard.button.callback(renderSelectDate(userData), CommandsName.WatchDate)],
                [Keyboard.button.callback(renderSelectFromCity(userData), CommandsName.CityFrom)],
                [Keyboard.button.callback(renderSelectToCity(userData), CommandsName.CityTo)],
                [Keyboard.button.callback("НАЙТИ", CommandsName.WatchFind)],
                [Keyboard.button.callback("Главное меню", CommandsName.Start)]
            ])]
        }
    },
    [CommandsName.Month]: async (ctx?: Context): Promise<ButtonResult> => {
        const now = new Date()
        const currentMonth = now.getMonth();
        const userId = ctx!.user!.user_id;
        const {selectedYear, selectedMonth, selectedDay} = await userRedis.getData(userId);
        const endDay = getLastDayOfMonth(selectedYear, selectedMonth);

        const dayRows = [];
        for(let i = currentMonth === selectedMonth? selectedDay : 1; i <= endDay; i++){
            dayRows.push([Keyboard.button.callback(`${i}`, `day:${i}`)])
        }

        return {
            text: 'Выберите день: ',
            attachments: [Keyboard.inlineKeyboard(dayRows)]
        }
    },
    [CommandsName.Message]: (): ButtonResult => ({text: 'Выберите город:'}),
    [CommandsName.WatchFind]: (): ButtonResult => {
        return {
            text: '',
            attachments: [Keyboard.inlineKeyboard([])]
        }
    },
    [CommandsName.Buy]: (): ButtonResult => {
        const rows = PACKAGES.map((pkg) => [
            Keyboard.button.callback(`${pkg.label} — ${pkg.price}₽`, `buy-package:${pkg.key}`)
        ]);
        rows.push([Keyboard.button.callback("Главное меню", CommandsName.Start)]);

        return {
            text: '📦 Выберите пакет запросов\n\nСрок действия купленных запросов — 30 дней.',
            attachments: [Keyboard.inlineKeyboard(rows)]
        };
    }
}

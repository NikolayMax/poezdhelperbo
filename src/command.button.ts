import { Context, Keyboard } from "@maxhub/max-bot-api";
import type { AttachmentRequest } from "@maxhub/max-bot-api/types";
import { CommandsName, MonthNameRus, PACKAGES } from "./consts";
import { getLastDayOfMonth, renderSelectDate, renderSelectFromCity, renderSelectToCity } from "./lib";
import { userRedis } from "./redis";
import { getBalance, checkAndExpirePaid, getTotalAvailable } from "./balance";
import { getUserTracks } from "./tracker";

type ButtonResult = { text: string; attachments?: AttachmentRequest[] };

export const Buttons = {
    [CommandsName.Start]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx?.user?.user_id;
        if (!userId) return { text: '❌ Ошибка: пользователь не найден' };
        const total = getTotalAvailable(userId);
        const tracks = getUserTracks(userId);
        return {
            text: `🚂 Привет! Я помогу найти и отследить Ласточки 🐦\n\n` +
                  `📊 Твой профиль\n` +
                  `   💳 Баланс запросов: ${total}\n` +
                  `   🚂 Треков:   ${tracks.length}\n\n` +
                  `👥 Пригласи друга — получи +3 запроса\n\n` +
                  `Выбери действие 👇`,
            attachments: [Keyboard.inlineKeyboard([
                [Keyboard.button.callback("🔍 Начать поиск", CommandsName.Watch)],
                [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
                [Keyboard.button.callback("💳 Купить запросы", CommandsName.Buy)],
                [Keyboard.button.callback("🤝 Пригласить друга", "referral-info")],
                [Keyboard.button.callback("❓ Помощь", CommandsName.Help)],
            ])]
        };
    },
    [CommandsName.Balance]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx?.user?.user_id;
        if (!userId) return { text: '❌ Ошибка: пользователь не найден' };
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
    [CommandsName.WatchDate]: async (_ctx?: Context): Promise<ButtonResult> => {
        const currentMonth = new Date().getMonth();
        const monthRows = [];
        for (let i = currentMonth; i < 12; i++) {
            const label = i === currentMonth ? `📅 ${MonthNameRus[i]}` : (MonthNameRus[i] ?? `${i}`);
            monthRows.push([Keyboard.button.callback(label, `month:${i}`)])
        }
        return {
            text: 'Выберите месяц: ',
            attachments: [Keyboard.inlineKeyboard(monthRows)]
        }
    },
    [CommandsName.Watch]: async (ctx?: Context): Promise<ButtonResult> => {
        const userId = ctx?.user?.user_id;
        if (!userId) return { text: '❌ Ошибка: пользователь не найден' };
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
        const userId = ctx?.user?.user_id;
        if (!userId) return { text: '❌ Ошибка: пользователь не найден' };
        const {selectedYear, selectedMonth} = await userRedis.getData(userId);
        const endDay = getLastDayOfMonth(selectedYear, selectedMonth);

        const dayRows: any[] = [];

        dayRows.push([
            Keyboard.button.callback('📅 Сегодня', 'today'),
            Keyboard.button.callback('📅 Завтра', 'tomorrow'),
        ]);

        dayRows.push(['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(d => Keyboard.button.callback(d, 'noop')));

        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;

        let row: { text: string; payload: string }[] = [];
        for (let j = 0; j < offset; j++) {
            row.push(Keyboard.button.callback('·', 'noop'));
        }

        for (let i = 1; i <= endDay; i++) {
            row.push(Keyboard.button.callback(`${i}`, `day:${i}`));
            if (row.length === 7) {
                dayRows.push(row);
                row = [];
            }
        }

        if (row.length > 0) {
            while (row.length < 7) {
                row.push(Keyboard.button.callback('·', 'noop'));
            }
            dayRows.push(row);
        }

        return {
            text: 'Выберите день или Сегодня/Завтра: ',
            attachments: [Keyboard.inlineKeyboard(dayRows)]
        }
    },
    [CommandsName.Message]: (): ButtonResult => ({text: 'Выберите город:'}),
    [CommandsName.WatchFind]: (): ButtonResult => ({
        text: '',
    }),
    SubscriptionPrompt: (): ButtonResult => {
        const channelLink = process.env.CHANNEL_LINK || 'канал';
        const text =
            `📢 Для использования бота нужно подписаться на канал!\n\n` +
            `${channelLink}\n\n` +
            `После подписки нажмите кнопку ниже.`;
        return {
            text,
            attachments: [Keyboard.inlineKeyboard([
                [Keyboard.button.callback("✅ Я подписался", "check-subscription")],
            ])]
        };
    },
    [CommandsName.Buy]: (): ButtonResult => {
        const rows = PACKAGES.map((pkg) => [
            Keyboard.button.callback(`${pkg.label} — ${pkg.price}₽`, `buy-package:${pkg.key}`)
        ]);
        rows.push([Keyboard.button.callback("🤝 Пригласить друга", "referral-info")]);
        rows.push([Keyboard.button.callback("Главное меню", CommandsName.Start)]);

        return {
            text: '📦 Выберите пакет запросов\n\nСрок действия купленных запросов — 30 дней.\n\n🤝 За каждого приглашённого друга вы получаете +3 запроса!',
            attachments: [Keyboard.inlineKeyboard(rows)]
        };
    }
}

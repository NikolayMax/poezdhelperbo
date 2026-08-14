import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { guardSubscription } from "../referral";

const action = (bot: Bot) => {
    bot.action(CommandsName.Help, async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        if (!await guardSubscription(ctx, userId, bot)) return;
        const keyboard = Keyboard.inlineKeyboard([
            [Keyboard.button.callback("Начать поиск", CommandsName.Watch)],
            [Keyboard.button.callback("Главное меню", CommandsName.Start)]
        ]);

        ctx.reply(
            '🚂 <b>Туда-Сюда</b> — поиск поездов и электричек\n\n' +
            'Как пользоваться:\n' +
            '1. Нажмите «Начать поиск»\n' +
            '2. Выберите город отправления и прибытия\n' +
            '3. Выберите дату\n' +
            '4. Нажмите «НАЙТИ»\n\n' +
            'У вас есть 10 бесплатных запросов. После — можно купить пакеты.',
            { format: 'html', attachments: [keyboard] }
        );
    });
}
export default action;
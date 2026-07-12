import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";

const action = (bot: Bot) => {
    bot.action(CommandsName.Help, async (ctx) => {
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
            'У вас есть 3 бесплатных запроса. После — можно купить пакеты.',
            { format: 'html', attachments: [keyboard] }
        );
    });
}
export default action;
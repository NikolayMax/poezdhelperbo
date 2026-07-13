import { Bot, Keyboard } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { Buttons } from "../command.button";
import { isUserRegistered, isUserSubscribed } from "../referral";

const action = (bot: Bot) => {
    bot.command('start', async (ctx) => {
        const userId = ctx.message?.sender?.user_id;
        if (!userId) return;

        console.log(`[/START] userId=${userId}`);

        if (!isUserRegistered(userId)) {
            const keyboard = Keyboard.inlineKeyboard([
                [Keyboard.button.requestContact("📱 Поделиться контактом")],
            ]);
            ctx.reply(
                '👋 Добро пожаловать!\n\n' +
                'Я помогу найти и отследить Ласточки 🐦\n\n' +
                'Для начала работы поделитесь контактом, чтобы зарегистрироваться.\n\n' +
                '📢 После регистрации необходимо подписаться на канал для использования бота.\n\n' +
                'Если вас пригласил друг — он мог отправить вам ссылку. Регистрируйтесь и бонус зачислится автоматически.',
                { attachments: [keyboard] }
            );
            return;
        }

        if (process.env.CHANNEL_ID && !isUserSubscribed(userId)) {
            const { text, attachments } = Buttons.SubscriptionPrompt();
            ctx.reply(text, { attachments });
            return;
        }

        const {text, attachments} = await Buttons[CommandsName.Start](ctx);
        ctx.reply(text, { attachments });
    });
}
export default action;
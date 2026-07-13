import { Bot, Keyboard } from "@maxhub/max-bot-api";
import {config} from "dotenv";
import {actions} from "./commands";
import { Buttons } from "./command.button";
import { CommandsName } from "./consts";
import { startTracker } from "./tracker";
import { createDependencies } from "./container";
import { isUserRegistered, isUserSubscribed } from "./referral";

process.on('unhandledRejection', (reason) => {
    console.error('[UNHANDLED REJECTION]', reason instanceof Error ? `${reason.message}\n${reason.stack}` : reason);
});

function init() {
    const { parsed } = config();

    if (!parsed) {
        console.error('Error: .env file not found');
        return;
    }

    if(!parsed.MAX_BOT_TOKEN) {
        throw new Error("MAX_BOT_TOKEN not found in .env");
    }

    const bot = new Bot(parsed.MAX_BOT_TOKEN);
    const deps = createDependencies();

    bot.on('bot_started', async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) return;

        const payload = ctx.startPayload;
        console.log(`[BOT_STARTED] userId=${userId} payload=${payload || 'none'}`);
        if (payload?.startsWith('ref_')) {
            const referrerId = Number(payload.slice(4));
            if (referrerId && referrerId !== userId) {
                const userData = await deps.redis.getData(userId);
                userData.pendingReferral = referrerId;
                await deps.redis.setData(userId, userData);
                console.log(`[BOT_STARTED] userId=${userId} pendingReferral=${referrerId}`);
            }
        }

        if (!isUserRegistered(userId)) {
            const keyboard = Keyboard.inlineKeyboard([
                [Keyboard.button.requestContact("📱 Поделиться контактом")],
            ]);
            ctx.reply(
                '👋 Добро пожаловать!\n\n' +
                'Я помогу найти и отследить Ласточки 🐦\n\n' +
                'Для начала работы поделитесь контактом, чтобы зарегистрироваться.\n\n' +
                (process.env.CHANNEL_ID ? '📢 После регистрации необходимо подписаться на канал для использования бота.\n\n' : '') +
                'Если вас пригласил друг — он мог отправить вам ссылку. Регистрируйтесь и бонус зачислится автоматически.',
                { attachments: [keyboard] }
            );
            return;
        }

        bot.api.setMyCommands([
            { name: 'start', description: 'Главное меню' },
        ]);

        if (process.env.CHANNEL_ID && !isUserSubscribed(userId)) {
            const { text, attachments } = Buttons.SubscriptionPrompt();
            ctx.reply(text, { attachments });
            return;
        }

        const { text, attachments } = await Buttons[CommandsName.Start](ctx);
        ctx.reply(text, { attachments });
    });

    bot.on('message_callback', (ctx, next) => {
        ctx.answerOnCallback({ notification: '' }).catch((err) => console.error('[ANSWER CALLBACK]', err));
        return next();
    })

    for(const action of actions){
        action(bot, deps);
    }

    bot.action('noop', () => {});

    startTracker(
        (userId, track) => {
            bot.api.sendMessageToUser(
                userId,
                `🚂 <b>${track.train_number}</b> — ${track.train_name}\n<b>💺 Появились свободные места 🔥 Успей купить!!!</b>\n📅 ${track.date}  🕒 ${track.departure_time} → ${track.arrival_time}\n\n⚠️ Уведомление получили и другие пользователи.\nУспейте занять место!`,
                { format: 'html', attachments: [Keyboard.inlineKeyboard([
                    [Keyboard.button.callback("Главное меню", CommandsName.Start)],
                ])] }
            ).catch((err) => console.error('[NOTIFY] sendMessageToUser:', err));
        },
        (userId, track) => {
            bot.api.sendMessageToUser(
                userId,
                `⏰ Время отслеживания <b>${track.train_number}</b> — ${track.train_name} истекло.\nМеста так и не появились.`,
                { format: 'html' }
            ).catch((err) => console.error('[EXPIRY] sendMessageToUser:', err));
        },
    );

    bot.catch((err) => console.error('[BOT ERROR]', err instanceof Error ? `${err.message}\n${err.stack}` : err));
    bot.start();
}

init();

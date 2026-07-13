import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName } from "../consts";
import { removeTrack, getTrackById } from "../tracker";

const action = (bot: Bot) => {
    bot.action(new RegExp(CommandsName.RemoveTrack), async (ctx) => {
        const userId = ctx.user?.user_id;
        if (!userId) {
            await ctx.answerOnCallback({ notification: '❌ Ошибка авторизации' }).catch((err) => console.error(`[AUTH GUARD]`, err));
            return;
        }
        const trackId = Number(ctx.match?.[1]);
        if (!trackId) return;

        const track = getTrackById(trackId);
        if (!track || track.user_id !== userId) {
            return;
        }

        console.log(`[REMOVE-TRACK] userId=${userId} trackId=${trackId} train=${track.train_number}`);
        removeTrack(trackId, userId);

        ctx.reply(`❌ Отслеживание поезда <b>${track.train_number}</b> удалено.`, {
            format: 'html',
            attachments: [Keyboard.inlineKeyboard([
                [Keyboard.button.callback("🚂 Мои электрички", CommandsName.MyTrains)],
                [Keyboard.button.callback("Главное меню", CommandsName.Start)],
            ])]
        });
    });
}
export default action;

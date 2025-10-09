import {userRedis} from "./redis";

export const middleware = async (ctx:any, next:any) => {
    const userId = ctx.from?.id;
    const userData = await userRedis.getData(userId);
    console.log(userId, userData)

    return next();
    // console.log(ctx)
    //
    // const previousMessageId = ctx.session.prevMessageId;
    //
    // ctx.session.prevMessageId = ctx.callbackQuery ?
    //         ctx.callbackQuery.message.message_id : ctx.update.message?.message_id;
    //
    // console.log(previousMessageId)
    //
    // if (previousMessageId) {
    //     try {
    //         await ctx.deleteMessage(previousMessageId);
    //         console.log(`Удалили предыдущее сообщение: ${previousMessageId}`);
    //     } catch (error: any) {
    //         console.log('Не удалось удалить предыдущее сообщение:', error.message);
    //     }
    // }
    //
    // return next()
}
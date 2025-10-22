import {WATCH_ACTIVE} from "./consts";
import {Action} from "../../decorator";
import { UserRedis} from "../../services";
import {ActionContext} from "../../types";
import {ScheduleService} from "../../services";
import {InlineKeyboard} from "grammy";

export class WatchActiveAction{
    constructor(
        private readonly userRedis: UserRedis,
        private readonly scheduleService: ScheduleService
        ) {}

    @Action(WATCH_ACTIVE)
    async action(ctx: ActionContext){
        const userId = ctx.from.id;
        const userData = await this.userRedis.getData(userId);
        const schedules = await this.scheduleService.getSchedules();

        if(userData.activeSchedules.length < 1) {
            const message = await ctx.reply('👀 Вы ничего не отслеживаете');
            ctx.session.messageIds.push(message.message_id);
            return;
        }

        const message = await ctx.reply('🔍 Активный список: ');
        ctx.session.messageIds.push(message.message_id);

        for (const train of userData.activeSchedules) {
            const schedule = schedules[train.routeId];
            if(!schedule) {
                continue;
            }
            const inlineKeyboard = new InlineKeyboard();
            const {trainNumber, cityFrom, cityTo, date, departure_time, arrival_time} = schedule;
            inlineKeyboard
                .text(
                    `❌ Отменить`,
                    `cancel-${this.scheduleService.getKeyRoute(+trainNumber, cityFrom.id, cityTo.id, date)}`
                );

            const message = await ctx.reply(`
📅 <b>Дата:</b> ${date}
🕒 <b>Время:</b> ${departure_time} → ${arrival_time}
<b>Поезд: </b>${cityFrom.name} - ${cityTo.name}
`.trim(), {
                parse_mode: 'HTML',
                reply_markup: inlineKeyboard,
            });
            ctx.session.messageIds.push(message.message_id);
        }
    }
}
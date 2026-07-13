import { Keyboard, Bot } from "@maxhub/max-bot-api";
import { CommandsName, CurrentSelectCity } from "../consts";
import { Buttons } from "../command.button";
import type { AppDependencies } from "../container";
import { isUserRegistered, registerUser } from "../referral";

function parseVcf(vcf: string): { phone: string; name: string | null } {
    let phone = '';
    let name: string | null = null;
    for (const line of vcf.split('\n')) {
        if (line.startsWith('TEL')) {
            phone = line.replace(/^TEL[^:]*:/, '').replace(/[\r\n]/g, '').trim();
        } else if (line.startsWith('FN:')) {
            name = line.replace(/^FN:/, '').replace(/[\r\n]/g, '').trim();
        }
    }
    return { phone, name };
}

const action = (bot: Bot, deps: AppDependencies) => {
    bot.on('message_created', async (ctx) => {
        const userId = ctx.message?.sender?.user_id;
        if (!userId) return;

        const msg = ctx.message as any;
        const contactAttachments = msg?.body?.attachments?.filter((a: any) => a.type === 'contact');

        if (contactAttachments && contactAttachments.length > 0) {
            const contact = contactAttachments[0]!;
            const payload = contact.payload as { vcf_info?: string };
            if (!payload?.vcf_info) return;

            if (isUserRegistered(userId)) {
                ctx.reply('✅ Вы уже зарегистрированы.');
                return;
            }

            const { phone, name } = parseVcf(payload.vcf_info);
            registerUser(userId, phone, name);

            if (process.env.CHANNEL_ID) {
                const { text, attachments } = Buttons.SubscriptionPrompt();
                ctx.reply('✅ Регистрация прошла успешно!\n\n' + text, { attachments });
                return;
            }

            const { text, attachments } = await Buttons[CommandsName.Start](ctx);
            ctx.reply('✅ Регистрация прошла успешно!\n\n' + text, { attachments });
            return;
        }

        const text = ctx.message?.body?.text;
        if (!text) return;

        const userData = await deps.redis.getData(userId);

        if (userData.currentSelectCity !== CurrentSelectCity.From &&
            userData.currentSelectCity !== CurrentSelectCity.To) {
            return;
        }

        try {
            const cities = await deps.trainsApi.suggestStations(text);

            if (cities.length === 0) {
                ctx.reply('😕 Города не найдены. Попробуйте другое название.');
                return;
            }

            userData.cities = cities;
            await deps.redis.setData(userId, userData);
            try { await ctx.deleteMessage(); } catch (err: any) { console.error('[DELETE MESSAGE]', err?.message ?? err); }
            const result = await Buttons[CommandsName.Message]()
            ctx.reply(result.text, {
                attachments: [Keyboard.inlineKeyboard(
                    cities.map((city) => [Keyboard.button.callback(city.name, `select-city:${city.slug}`)])
                )]
            });
        } catch (error) {
            console.error('Ошибка при поиске города:', error);
            ctx.reply('❌ Не удалось найти город. Попробуйте позже.');
        }
    });
}
export default action;

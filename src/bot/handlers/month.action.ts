import { CommandsName } from '../../utils/consts';
import { Markup, Telegraf, Context } from 'telegraf';
import { userRedis } from '../../services/user.service';
import { getLastDayOfMonth } from '../../utils/lib';

export const Buttons = async (ctx: Context) => {
  const days = [];
  const now = new Date();
  if (!ctx.from) {
    return {
      text: 'Не удалось получить информацию о пользователе',
      buttons: Markup.inlineKeyboard([]),
    };
  }

  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const userId = ctx.from.id;
  const { selectedYear, selectedMonth, selectedDay } =
    await userRedis.getData(userId);
  const endDay = getLastDayOfMonth(selectedYear, selectedMonth);

  for (
    let i = currentMonth === selectedMonth ? currentDay : 1;
    i <= endDay;
    i++
  ) {
    days.push(Markup.button.callback(`${i}`, `day:${i}`));
  }

  return {
    text: 'Выберите день: ',
    buttons: Markup.inlineKeyboard(days, { columns: 7 }),
  };
};
const actionMonth = (bot: Telegraf) => {
  bot.action(new RegExp(CommandsName.Month), async (ctx) => {
    const userId = ctx.from.id;
    const userData = await userRedis.getData(userId);
    userData.selectedMonth = Number(ctx.match[1]);
    await userRedis.setData(userId, userData);

    const { text, buttons } = await Buttons(ctx);

    ctx.reply(text, buttons);
  });
};

export default actionMonth;

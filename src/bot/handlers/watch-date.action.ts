import { Markup, Telegraf, Context } from 'telegraf';
import { CommandsName, MonthNameRus } from '../../utils/consts';
import { userRedis } from '../../services/user.service';

export const Buttons = async (ctx: Context) => {
  if (!ctx.from) {
    return {
      text: 'Не удалось получить информацию о пользователе',
      buttons: Markup.inlineKeyboard([]),
    };
  }
  const months = [];
  const userId = ctx.from.id;
  const { selectedMonth } = await userRedis.getData(userId);

  for (let i = selectedMonth ? selectedMonth : 0; i < 12; i++) {
    months.push(Markup.button.callback(MonthNameRus[i], `month:${i}`));
  }
  return {
    text: 'Выберите месяц: ',
    buttons: Markup.inlineKeyboard(months, { columns: 4 }),
  };
};

const action = (bot: Telegraf) => {
  bot.action(CommandsName.WatchDate, async (ctx) => {
    const { text, buttons } = await Buttons(ctx);
    ctx.reply(text, buttons);
  });
};

export default action;

import { Telegraf } from 'telegraf';
import { CommandsName, CurrentSelectCity } from '../../utils/consts';
import { userRedis } from '../../services/user.service';

export const Buttons = () => ({
  text: 'Введите город откуда:',
});

const action = (bot: Telegraf) => {
  bot.action(CommandsName.CityFrom, async (ctx) => {
    const { text } = Buttons();
    const userId = ctx.from.id;
    const userData = await userRedis.getData(userId);
    userData.currentSelectCity = CurrentSelectCity.From;
    await userRedis.setData(userId, userData);
    ctx.reply(text);
  });
};

export default action;

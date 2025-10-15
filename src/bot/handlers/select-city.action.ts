import { Telegraf } from 'telegraf';
import { CommandsName, CurrentSelectCity } from '../../utils/consts';
import { Buttons } from './watch.action';
import { userRedis } from '../../services/user.service';

export const actionSelectCity = (bot: Telegraf) => {
  bot.action(new RegExp(CommandsName.SelectCity), async (ctx) => {
    const slug = ctx.match[1];
    const userId = ctx.from?.id;
    const userData = await userRedis.getData(userId);
    const currentCity = userData?.cities?.find((city) => city.slug === slug);

    if (userData.currentSelectCity === CurrentSelectCity.From) {
      userData.cityFrom = currentCity;
    } else {
      userData.cityTo = currentCity;
    }

    await userRedis.setData(userId, userData);

    const { text, buttons } = await Buttons(ctx);
    ctx.reply(text, buttons);
  });
};

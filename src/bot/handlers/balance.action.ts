import { Markup, Telegraf } from 'telegraf';
import { CommandsName } from '../../utils/consts';

export const Buttons = () => ({
  text: 'Ваш Баланс: 10 запросов',
  buttons: Markup.inlineKeyboard([
    Markup.button.callback('Главное меню', CommandsName.Start),
  ]),
});

const action = (bot: Telegraf) => {
  bot.action(CommandsName.Balance, (ctx) => {
    const { text, buttons } = Buttons();
    ctx.reply(text, buttons);
  });
};

export default action;

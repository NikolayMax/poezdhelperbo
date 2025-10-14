import { Markup, Telegraf } from "telegraf";
import { CommandsName } from "../../utils/consts";
import { userRedis } from "../../services/user.service";
import { ITrain } from "../../types/traine.interface";
import {getSvrpkTickets, searchRzdTickets} from "../../api";
import {generateDetailedTrainMessage} from "../../utils/message";
import {IRzdTrain} from "../../types/rzd-train.interface";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.WatchFind, async (ctx) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);
        const { cityFrom, cityTo, selectedYear, selectedMonth, selectedDay } = userData;
        if (!cityFrom || !cityTo){
            return ctx.reply('Не выбраны города или город');
        }
        userData.cities = [];



        const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`
        const trains = await searchRzdTickets<{Trains: IRzdTrain[]}>(cityFrom.id.toString(), cityTo.id.toString(), date)
        const unixTimestamp = Math.floor((new Date(selectedYear, selectedMonth, selectedDay+1)).getTime() / 1000);
        const trains2 = await getSvrpkTickets<{data: ITrain[]}>(cityFrom.id, cityTo.id, unixTimestamp.toString())

        trains.Trains.filter(train => train.IsSuburban === true).forEach((train) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback("Отследить место", `watch-place:${train.TrainNumber}`),
            ])

            const trainFind = trains2.data.find((item) => item.number === train.TrainNumber);

            if(trainFind) {
                console.log(trainFind)
                train.countSeats = trainFind.place_count;
            }

            ctx.reply(generateDetailedTrainMessage(train), {
                parse_mode: 'HTML',
                ...keyboard
            })
        })
    })
}
export default action;

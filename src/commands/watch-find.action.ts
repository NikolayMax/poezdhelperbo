import {Markup, Telegraf} from "telegraf";
import {CommandsName} from "../consts";
import axios from "axios";
import {userRedis} from "../redis";
import {ITrain} from "../types/traine.interface";

const action = (bot: Telegraf) => {
    bot.action(CommandsName.WatchFind, async (ctx) => {
        const userId = ctx.from.id;
        const userData = await userRedis.getData(userId);
        userData.cities = [];
        console.log(userData);
        const {cityFrom, cityTo, selectedYear, selectedMonth, selectedDay} = userData;

        if(!cityFrom || !cityTo)
            return ctx.reply('Не выбраны города или город');

        let tains: ITrain[] = [];
        for(let i = 0; i < 3; i++){
            const unixTimestamp = Math.floor((new Date(selectedYear, selectedMonth, selectedDay+i)).getTime() / 1000);
            const url = `https://api.svrpk.ru/api/v1/train-tickets?station_from=${cityFrom.id}&station_to=${cityTo.id}&date=${unixTimestamp}`

            console.log(url)
            const {data} = await axios.get<{data: ITrain[]}>(url)

            tains = data.data.reduce((acc, train) => {
                const isFind= acc.find((trainAcc) => trainAcc.id === train.id);
                if(!isFind){
                    acc.push(train);
                }
                return acc;
            }, tains)
        }

        console.log(tains)



        tains.forEach((train) => {
            const keyboard = Markup.inlineKeyboard([
                Markup.button.callback("Отследить место", `watch-place:${train.id}`),
            ])
            ctx.reply(generateDetailedTrainMessage(train), {
                parse_mode: 'HTML',
                ...keyboard
            })
        })
    })
}

function generateDetailedTrainMessage(train: ITrain) {
    return `
        🚂 <b>${train.number}</b> - ${train.name}

        📅 <b>Дата:</b> ${train.departure_data.date}
        🕒 <b>Время:</b> ${train.departure_data.time} → ${train.arrival_data.time}
        ⏱ <b>В пути:</b> ${train.travel_time}

        🏁 <b>Станции:</b>
        ▫️ Отправление: ${train.departure_data.station}
        ▫️ Прибытие: ${train.arrival_data.station}

        💺 <b>Доступные места:</b>
        ${generateSeatsMessage(train.place_count)}

        💰 <b>Стоимость:</b> от ${train.cost_data.SCHOOL_STUDENTS_CADETS.cost} ₽
  `.trim();
}

function generateSeatsMessage(count: number) {
    if (count < 1) {
        return '❌ Мест нет';
    }

    return `▫️ ${count} мест •`;
}
export default action;
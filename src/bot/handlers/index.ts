import start from "./start.action";
import startCommand from "./start.command";
import cityToAction from "./city-to.action";
import cityFromAction from "./city-from.action";
import balanceAction from "./balance.action";
import watchAction from "./watch.action";
import watchDateAction from "./watch-date.action";
import Message from "./message";
import actionMonth from "./month.action";
import actionDay from "./day.action";
import {actionSelectCity} from "./select-city.action";
import watchFindAction from "./watch-find.action";

export const actions = [
    start,
    startCommand,

    cityToAction,
    cityFromAction,

    balanceAction,

    watchAction,
    watchDateAction,

    Message,
    actionMonth,
    actionDay,

    actionSelectCity,
    watchFindAction
]
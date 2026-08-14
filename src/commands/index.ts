import { Bot } from "@maxhub/max-bot-api";
import type { IAppDependencies } from "../container";
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
import buyAction from "./buy.action";
import buyCommand from "./buy.command";
import buyPackageAction from "./buy-package.action";
import adminAction from "./admin.action";
import helpAction from "./help.action";
import watchPlaceAction from "./watch-place.action";
import myTrainsAction from "./my-trains.action";
import removeTrackAction from "./remove-track.action";
import checkPaymentAction from "./check-payment.action";
import registerAction from "./register.action";

type ActionFn = (bot: Bot, deps: IAppDependencies) => void;

export const actions: ActionFn[] = [
    start,
    startCommand,

    cityToAction,
    cityFromAction,

    balanceAction,

    watchAction,
    watchDateAction,
    watchPlaceAction,

    Message,
    actionMonth,
    actionDay,

    actionSelectCity,
    watchFindAction,

    buyAction,
    buyCommand,
    buyPackageAction,
    adminAction,
    helpAction,
    myTrainsAction,
    removeTrackAction,
    checkPaymentAction,
    registerAction,
];

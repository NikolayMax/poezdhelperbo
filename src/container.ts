import { userRedis } from './redis';
import { trainsApi } from './api/trains.api';
import * as balance from './balance';
import * as tracker from './tracker';
import { createPayment, checkPayment } from './payments/tinkoff';

export interface IAppDependencies {
  redis: typeof userRedis;
  trainsApi: typeof trainsApi;
  balance: typeof balance;
  tracker: typeof tracker;
  payments: { createPayment: typeof createPayment; checkPayment: typeof checkPayment };
}

export function createDependencies(): IAppDependencies {
  return {
    redis: userRedis,
    trainsApi,
    balance,
    tracker,
    payments: { createPayment, checkPayment },
  };
}

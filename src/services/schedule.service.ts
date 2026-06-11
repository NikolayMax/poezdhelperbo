import { BotContext, IAddScheduleParams, ITrainSchedule, IWatchSchedule, TKeyRoute } from '../types';
import { Redis } from './redis.service';
import { UserRedis } from './user.service';
import { ApiService } from './api.service';
import { Bot } from 'grammy';

export class ScheduleService {
	private readonly key = 'schedules';
	private readonly CHECK_INTERVAL = 30000; // 30 секунд
	private isRunning = false;
	private intervalId: NodeJS.Timeout | null = null;
	private requestCache = new Map<TKeyRoute, { data: ITrainSchedule[]; timestamp: number }>();
	private readonly CACHE_TTL = 30000;
	private readonly WATCH_TIMEOUT = 24 * 60 * 60; // 24 hours in seconds

	constructor(
		private readonly bot: Bot<BotContext>,
		private readonly redis: Redis,
		private readonly userRedis: UserRedis,
		private readonly api: ApiService,
	) {}

	async getSchedules(): Promise<Record<TKeyRoute, IWatchSchedule>> {
		return (await this.redis.get<Record<TKeyRoute, IWatchSchedule>>(this.key)) || {};
	}

	private async setSchedules(schedules: Record<TKeyRoute, IWatchSchedule>) {
		await this.redis.set(this.key, schedules);
	}

	getKeyRoute(trainNumber: string, fromId: number, toId: number, date: string): TKeyRoute {
		return `train:${trainNumber}:${fromId}:${toId}:${date}`;
	}

	async startScheduler() {
		if (this.isRunning) return;
		await this.restoreSchedules();
		this.isRunning = true;
		this.intervalId = setInterval(async () => {
			console.log(`interval run: ${new Date().toISOString()}`);
			await this.checkAllSchedules();
		}, this.CHECK_INTERVAL);

		console.log('Scheduler started');
	}

	async stopScheduler(): Promise<void> {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
	}

	private async checkAllSchedules(): Promise<void> {
		try {
			const allSchedules = await this.getSchedules();

			for (const [routeKey, schedule] of Object.entries(allSchedules)) {
				await this.processSchedule(routeKey as TKeyRoute, schedule);
			}
		} catch (error) {
			console.error('Error checking schedules:', error);
		}
	}

	private async processSchedule(routeKey: TKeyRoute, schedule: IWatchSchedule): Promise<void> {
		const { trainNumber, date, cityFrom, cityTo, watchers } = schedule;

		// Получаем данные о поезде
		const trainData = await this.getCachedTrainData(trainNumber, cityFrom.id, cityTo.id, date);
		if (!trainData) return;

		const targetTrain = trainData.find((t) => t.train_number === trainNumber);
		if (!targetTrain) return;

		// Проверяем места и списываем время у пользователей
		for (const userId of watchers) {
			await this.processUserWatch(userId, routeKey, targetTrain);
		}
	}

	private async getCachedTrainData(trainNumber: string, fromId: number, toId: number, date: string) {
		const cacheKey = this.getKeyRoute(trainNumber, fromId, toId, date);
		const now = Date.now();

		const cached = this.requestCache.get(cacheKey);

		if (cached && now - cached.timestamp < this.CACHE_TTL) {
			return cached.data;
		}

		// Делаем запрос к API
		console.log(`Making API request for ${fromId}->${toId} on ${date}`);
		const { success, data: trainData } = await this.api.getSchedule(fromId, toId, date);
		if (!success) return;
		// Сохраняем в кэш
		this.requestCache.set(cacheKey, {
			data: trainData.data,
			timestamp: now,
		});

		return trainData.data;
	}

	private async processUserWatch(userId: number, routeKey: TKeyRoute, train: ITrainSchedule): Promise<void> {
		const user = await this.userRedis.getData(userId);
		const userSchedule = user.activeSchedules.find((s) => s.routeId === routeKey);

		if (!userSchedule) {
			// У пользователя нет этого отслеживания - удаляем из watchers
			await this.removeWatcherFromSchedule(routeKey, userId);
			return;
		}

		// Рассчитываем прошедшее время с начала отслеживания
		const now = new Date();
		const startTime = new Date(userSchedule.startTime);
		const totalSecondsPassed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

		// Обновляем потраченное время
		userSchedule.spentSeconds = totalSecondsPassed;

		// Проверяем лимиты
		if (user.chatId && totalSecondsPassed >= this.WATCH_TIMEOUT) {
			// Время вышло - удаляем отслеживание
			await this.stopUserWatch(userId, routeKey);
			const userData = await this.userRedis.getData(userId);
			const message = await this.bot.api.sendMessage(
					user.chatId,
					`⏰ <b>Время отслеживания истекло</b>\n\nПоезд ${train.train_number} больше не отслеживается.\nВы можете запустить новый поиск через главное меню.`,
					{ parse_mode: 'HTML' },
				);
			userData.messageIds.push(message.message_id);
			await this.userRedis.setData(userId, userData);
			return;
		}

		// Если есть места - уведомляем и останавливаем отслеживание
		if (user.chatId && train.places_count && train.places_count > 0) {
			const userData = await this.userRedis.getData(userId);
			const schedule = await this.getSchedules();
			const scheduleData = schedule[routeKey];
			const message = await this.bot.api.sendMessage(
				user.chatId,
				`🎉 <b>Найдены места!</b>\n\n🚂 Поезд: ${train.train_number}\n📅 Дата: ${scheduleData?.date || 'неизвестно'}\n🎫 Свободные места: ${train.places_count}\n\nПерейдите на сайт РЖД для покупки билетов!`,
				{ parse_mode: 'HTML' },
			);
			userData.messageIds.push(message.message_id);
			await this.userRedis.setData(userId, userData);
			await this.stopUserWatch(userId, routeKey);
			return;
		}

		// Сохраняем обновленные данные пользователя
		await this.userRedis.setData(userId, user);
	}

	// Остановка отслеживания
	async stopUserWatch(userId: number, routeKey: TKeyRoute): Promise<void> {
		// Удаляем пользователя из расписания
		await this.removeWatcherFromSchedule(routeKey, userId);

		// Удаляем расписание у пользователя
		await this.userRedis.removeUserSchedule(userId, routeKey);
	}

	private async removeWatcherFromSchedule(routeKey: TKeyRoute, userId: number): Promise<void> {
		const schedules = await this.getSchedules();

		if (schedules[routeKey]) {
			schedules[routeKey].watchers = schedules[routeKey].watchers.filter((id) => id !== userId);

			// Если больше нет наблюдателей - удаляем расписание
			if (schedules[routeKey].watchers.length === 0) {
				delete schedules[routeKey];
			}

			await this.setSchedules(schedules);
		}
	}

	async restoreSchedules(): Promise<void> {
		const schedules = await this.getSchedules();

		for (const [routeKey, schedule] of Object.entries(schedules)) {
			for (const userId of schedule.watchers) {
				const user = await this.userRedis.getData(userId);
				const userSchedule = user.activeSchedules.find((s) => s.routeId === routeKey);

				if (userSchedule) {
					// Пересчитываем потраченное время
					const startTime = new Date(userSchedule.startTime);
					const now = new Date();
					const secondsPassed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

					userSchedule.spentSeconds = secondsPassed;

					// Если время вышло - очищаем
					if (secondsPassed >= this.WATCH_TIMEOUT) {
						await this.stopUserWatch(userId, routeKey as TKeyRoute);
					} else {
						await this.userRedis.setData(userId, user);
					}
				}
			}
		}

		console.log('Schedules restored after server restart');
	}

	async addScheduleWatch(params: IAddScheduleParams) {
		const { cityFrom, cityTo, date, trainNumber, userId, train } = params;
		const user = await this.userRedis.getData(userId);
		const routeKey = this.getKeyRoute(trainNumber, cityFrom.id, cityTo.id, date);

		const isAlreadyWatching = user.activeSchedules.some((s) => s.routeId === routeKey);
		if (user.chatId && isAlreadyWatching) {
			const userData = await this.userRedis.getData(userId);
const message = await this.bot.api.sendMessage(
			user.chatId,
			`❌ <b>Уже отслеживается</b>\n\nВы уже следите за поездом <b>${trainNumber}</b> на <b>${date}</b>.`,
			{ parse_mode: 'HTML' },
		);
			userData.messageIds.push(message.message_id);
			await this.userRedis.setData(userId, userData);
			return;
		}
		await this.addToSchedules(routeKey, {
			arrival_time: train.arrival_time,
			departure_time: train.departure_time,
			trainNumber,
			date,
			cityFrom,
			cityTo,
			watchers: [userId],
		});

		await this.userRedis.addUserSchedule(userId, {
			routeId: routeKey,
			startTime: new Date().toISOString(),
			spentSeconds: 0,
		});
		console.log(`start watch: ${new Date().toISOString()}`);

		const userData = await this.userRedis.getData(userId);
		const message = await this.bot.api.sendMessage(
			user.chatId!,
			`✅ <b>Отслеживание начато!</b>\n\n🚂 Поезд: ${trainNumber}\n📅 Дата: ${date}\n⏰ Я уведомлю вас, как только появятся свободные места.`,
			{ parse_mode: 'HTML' },
		);
		userData.messageIds.push(message.message_id);
		await this.userRedis.setData(userId, userData);
	}

	private async addToSchedules(routeKey: TKeyRoute, newSchedule: IWatchSchedule) {
		const schedules = await this.getSchedules();

		if (schedules[routeKey]) {
			schedules[routeKey].watchers.push(...newSchedule.watchers);
		} else {
			schedules[routeKey] = newSchedule;
		}

		await this.setSchedules(schedules);
	}
}

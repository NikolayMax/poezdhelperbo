import { ErrorType, HttpError, Result } from '../types';

export class HttpClientService {
	private fetchSettings = {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		},
		credentials: 'include',
	} as const;

	async get<T>(url: string) {
		try {
			const controller = new AbortController();
			setTimeout(() => controller.abort(), 5000);
			const response = await fetch(url, {
				...this.fetchSettings,
				signal: controller.signal,
			});
			if (!response.ok) {
				const error: HttpError = {
					type:
						response.status >= 100 && response.status < 200
							? ErrorType.INFORMATION
							: response.status >= 200 && response.status < 300
								? ErrorType.SUCCESS
								: response.status >= 300 && response.status < 400
									? ErrorType.REDIRECT
									: response.status >= 400 && response.status < 500
										? ErrorType.CLIENT_ERROR
										: ErrorType.SERVER_ERROR,
					message: `HTTP ${response.status}: ${response.statusText}`,
					status: response.status,
				};
				return this.failure(error);
			}
			const data = (await response.json()) as T;
			return this.success(data);
		} catch (error) {
			const httpError: HttpError = this.normalizeError(error);
			return this.failure(httpError);
		}
	}

	success<T>(data: T): Result<T, never> {
		return {
			success: true,
			data,
			error: undefined,
		};
	}

	failure<E>(error: E): Result<never, E> {
		return {
			success: false,
			error,
			data: undefined,
		};
	}

	private normalizeError(error: unknown): HttpError {
		if (error instanceof Error) {
			if (error.name === 'AbortError') {
				return {
					type: ErrorType.CLIENT_ERROR,
					message: 'Request timeout',
					code: 'TIMEOUT',
				};
			}

			return {
				type: ErrorType.SERVER_ERROR,
				message: error.message,
				code: error.name,
			};
		}

		return {
			type: ErrorType.SERVER_ERROR,
			message: 'Unknown network error',
		};
	}
}

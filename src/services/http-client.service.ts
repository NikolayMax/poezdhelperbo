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
			const timeoutId = setTimeout(() => controller.abort(), 5000);
			const response = await fetch(url, {
				...this.fetchSettings,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			if (!response.ok) {
				let bodyMessage = '';
				try {
					const body = await response.json() as { message?: string };
					bodyMessage = body.message ? `: ${body.message}` : '';
				} catch {}
				const error: HttpError = {
					type: response.status >= 500 ? ErrorType.SERVER_ERROR : ErrorType.CLIENT_ERROR,
					message: `HTTP ${response.status}${bodyMessage}`,
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

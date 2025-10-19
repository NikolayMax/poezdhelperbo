export type Result<T, E = Error> =
    | { success: true; data: T; error: undefined }
    | { success: false; data: undefined; error: E };

export enum ErrorType {
    INFORMATION = 'INFORMATION',
    SUCCESS = 'SUCCESS',
    REDIRECT = 'REDIRECT',
    CLIENT_ERROR = 'CLIENT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
}

export type HttpError = {
    type: ErrorType;
    message: string;
    status?: number;
    code?: string;
};
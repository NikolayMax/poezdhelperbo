export interface IPaymentResult {
    url: string;
    externalId: string;
}

export interface IPaymentCallbackResult {
    success: boolean;
    userId: number;
    amount: number;
}

export interface IPaymentProvider {
    createPayment(amount: number, userId: number, description: string): Promise<IPaymentResult>;
    processCallback(data: unknown): Promise<IPaymentCallbackResult>;
    checkPaymentStatus(paymentId: string): Promise<{ success: boolean; status: string }>;
}

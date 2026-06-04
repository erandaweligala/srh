export interface SubscriberProductAdditionModel {
    userId?: string;
    planId: string;
    serviceStartDate: Date;
    serviceEndDate: Date;
    status?: number;
    isGroup?: boolean;
}
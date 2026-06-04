export interface ServiceInfoModel {
    serviceId: string;
    username: string;
    status: string;
    planId: string;
    planType: string;
    recurringFlag: boolean;
    nextCycleStartDate: Date;
    expiryDate: Date;
    serviceStartDate: Date;
    serviceEndDate: Date;
    cycleDate: Date;
    currentCycleStartDate: Date;
    currentCycleEndDate: Date;
    isGroup: boolean;
    requestId: string;
}

export type ServiceInfoResponseModel = ServiceInfoModel[];

export interface NewServiceInfoModel {
    user_id: string;
    request_id: string;
    plan_id: string;
    service_start_date: Date;
    service_end_date: Date;
    status: number;
    is_group: boolean;

}

export interface ServiceInfoUpdateModel {
    quota?: number;
    balance_quota?: number;
    service_start_date?: Date;
    service_end_date?: Date;
    status?: number;
}
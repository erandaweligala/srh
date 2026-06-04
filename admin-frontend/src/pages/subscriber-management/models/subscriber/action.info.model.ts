export interface ActionInfoModel {
    actionType: string;
    planId: string;
    quota: string;
    quotaBalance: string;
    serviceStartDate: Date;
    serviceEndDate: Date;
    status: string;

    adminUser: string;
    groupId: string;
    requestId: string;
    dateTime: Date;
    action:string;
    userName: string;
    resultCode: string;
    httpStatus: string;
    description: string;
    channel?: string;
    responseTime?: number | string;
}

export interface ActionInfoResponseModel {
    page: number;
    page_size: number;
    total_records: number;
    logs: ActionInfoModel[];
}
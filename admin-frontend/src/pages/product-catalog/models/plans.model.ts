export interface PlansModel {
    planInternalId: number,
    planId: string,
    planName: string,
    planType: string,
    recurringFlag: boolean,
    recurringPeriod: string,
    status: string,
    connectionType: string,
    quotaProrationFlag: boolean,
    createdAt: string,
    updatedAt: string
}

export interface PlansResponseModel {
    plans: PlansModel[];
}
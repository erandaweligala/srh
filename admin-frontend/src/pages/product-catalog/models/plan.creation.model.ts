export interface PlanModel {
    planId: string,
    planName: string,
    planType: string,
    recurringFlag: boolean,
    recurringPeriod: string,
    status: string,
    connectionType: string,
    quotaProrationFlag: boolean,
    validityPeriod: number,
    validityType: string
}

export interface BucketModel {
    bucketId: string;
    isUnlimited: boolean;
    bucketName: string;
    initialQuota: number;
    carryForward: boolean;
    maxCarryForward: number;
    totalCarryForward: number;
    consumptionLimit: number;
    consumptionLimitWindow: string;
    carryForwardValidity: number;
}

export interface PlanCreationModel {
    plan: PlanModel;
    bucketList: BucketModel[];
}
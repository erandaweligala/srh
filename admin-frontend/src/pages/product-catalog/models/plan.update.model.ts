export interface PlanModel {
    planName: string,
    status: string,
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
    carryForwardValidity: number;
    consumptionLimit: number;
    consumptionLimitWindow: string;
}

export interface PlanUpdateModel {
    plan: PlanModel;
    bucketList: BucketModel[];
}
export interface BucketListModel {
    planToBucketId: number;
    bucketId: string;
    isUnlimited: boolean;
    carryForward: boolean;
    maxCarryForward: number;
    totalCarryForward: number;
    carryForwardValidity: number;
    consumptionLimit: number;
    consumptionLimitWindow: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductDetailsModel {
    planInternalId: number;
    planId: string;
    planName: string;
    planType: string;
    recurringFlag: boolean;
    recurringPeriod: string;
    status: string;
    connectionType: string;
    quotaProrationFlag: boolean;
    validityPeriod: number;
    validityType: string;
    createdAt: string;
    updatedAt: string;
    bucketList: BucketListModel[];
    approvalStatus: string;
}

export type ProductDetailsResponseModel = ProductDetailsModel;
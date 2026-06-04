export interface SpeedModel {
    uplinkSpeed: string;
    downlinkSpeed: string;
}

export interface ServiceDetailsModel {
    bucketId: string;
    initialQuota: number;
    usedQuota: number;
    remainingQuota: number;
    priority: number;
    expiration?: string | Date;
    speed: SpeedModel;
}

export type ServiceDetailsResponseModel = ServiceDetailsModel[];
export interface BucketModel {
    id: number,
    bucketId: string,
    bucketName: string,
    bucketType: string,
    qosId: number,
    priority: number,
    timeWindow: string,
}

export interface BucketResponseModel {
    buckets: BucketModel[];
}
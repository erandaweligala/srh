export interface QosModel {
    id: number,
    bngCode: string,
    qosProfileName: string,
    upLink: string,
    downLink: string,
    isDefault: boolean,
    createdDate?: string,
    updatedDate?: string
}

export interface QosResponseModel {
    qosProfiles: QosModel[];
}
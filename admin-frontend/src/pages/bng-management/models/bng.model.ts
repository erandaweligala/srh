export interface PageDetails {
    totalRecords: number;
    pageNumber: number;
    pageElementCount: number;
}

export interface BngModel {
    bngId: string;
    bngName: string;
    bngIp?: string;
    bngTypeVendor?: string;
    modelVersion?: string;
    nasIpAddress: string;
    nasIdentifier: string;
    coaIp?: string;
    coaPort?: number;
    sharedSecret: string;
    location?: string;
    status: string;
    // createdBy?: string;
    // updatedBy?: string;
    createdDate?: string | null;
    updatedDate?: string | null;
}

export interface BngResponseModel {
    pageDetails: PageDetails;
    BNGData: BngModel[];
}
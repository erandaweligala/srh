export interface VendorConfigData {
    id: number;
    vendorId: string;
    vendorName: string;
    attributeName: string;
    attributeId: number;
    valuePath: string;
    entity: string;
    dataType: string;
    parameter: string;
    isActive: boolean;
    attributePrefix: string;
    createdDate: string;
    createdBy: string;
    lastUpdatedDate: string;
    lastUpdatedBy: string;
}

export interface EntityMetadataResponse {
    success: boolean;
    message: string;
    data: string[];
}

export interface VendorConfigSearchResponseData {
    pageDetails: {
        totalRecords: number;
        pageNumber: number;
        pageElementCount: number;
    };
    VendorConfigData: VendorConfigData[];
}

export interface ConfigurationQueryParams {
    vendorId?: string;
    vendorName?: string;
    attributeId?: string;
    attributeName?: string;
    page: number;
    size: number;
}

export interface ConfigurationManagementModel extends VendorConfigData {
    vendorId: string;
    vendorName: string;
    attributeId: number;
    attributeName: string;
    valuePath: string;
    entity: string;
    parameter: string;
    dataType: string;
    isActive: boolean;
    attributePrefix: string;
}

export interface ConfigurationFormModel {
    id?: number;
    vendorId: string;
    vendorName: string;
    attributeId: number;
    attributeName: string;
    valuePath: string;
    entity: string;
    parameter: string;
    dataType: string;
    isActive: boolean;
    attributePrefix: string;
}

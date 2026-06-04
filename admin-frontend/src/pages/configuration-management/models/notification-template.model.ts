export interface SubTemplateModel {
    childTemplateId?: number;
    messageType: string;
    daysToExpire?: number | null;
    quotaPercentage: number;
    messageContent: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationTemplateModel {
    superTemplateId: number;
    templateName: string;
    status: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: string;
    updatedBy?: string;
    updatedAt?: string;
    // Optional fields if they might be populated later or for UI compatibility
    templates?: SubTemplateModel[];
}

export interface NotificationTemplatesQueryParams {
    status?: string;
    templateName?: string;
    isDefault?: boolean;
    page?: number;
    size?: number;
}

export interface NotificationTemplatesResponse {
    pageDetails: {
        totalRecords: number;
        pageNumber: number;
        pageElementCount: number;
    };
    TemplateData: NotificationTemplateModel[];
}

// export interface QuotaPercentageResponse {
//     data: number[];
// }
export interface PendingApprovalModel {
    planInternalId: number,
    planId: string,
    planName: string,
    approvalStatus: string,
    currentApprovalLevel: number,
    planStatus: string
}

export interface PageDetails {
    totalRecords: number;
    pageNumber: number;
    pageElementCount: number;
}

export interface PendingApprovalResponseModel {
    approvals: PendingApprovalModel[];
    pageDetails: PageDetails
}

export interface PendingApprovalRequestModel {
    planId?: string;
    planName?: string;
   
}

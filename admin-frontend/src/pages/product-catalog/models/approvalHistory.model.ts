export interface ApprovalHistoryModel {
    id: number;
    planId: string;
    approvalLevel: number;
    approverId: string;
    approverName: string;
    approverRole: string;
    action: string;
    comments: string;
    actionDate: string;
}

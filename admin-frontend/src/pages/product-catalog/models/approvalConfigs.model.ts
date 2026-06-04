export interface ApprovalConfigModel {
    approvalLevel: number;
    levelName: string;
}

export interface ApprovalConfigsResponseModel {
    approvalConfigs: ApprovalConfigModel[];
}

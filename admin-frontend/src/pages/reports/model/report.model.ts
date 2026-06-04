export interface ReportModel {
    id: string;
    createdBy: string;
    createdAt: string;
    reportType: string;
    reportStatus: string;
    lastUpdatedAt: string;
    filterValuesJson: string;
    updatedBy: string;
    updatedAt: string;
    executedUser: string;
    description: string;
    format:string;
    reportName: string;
}

export interface ReportDownloadQueryModel {
    createdBy: string | undefined;
    reportType: string | undefined;
    reportStatus: string | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
}
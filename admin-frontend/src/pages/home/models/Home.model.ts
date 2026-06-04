
export interface TicketByCategory {
    category:string,
    value:string
}
export interface OpenedTicketS {
    month: string,
    value: string
}

export interface HomeModel {
    pendingCount: string;
    rejectedCount: string;
    totalCount: string;
    closedCount: string;
    ticketByCategory: TicketByCategory[];
    openedTicketSummary:OpenedTicketS[]; 
}

export interface RecentActivities {
    dateTime: string;
    activity: string;
    adminUser: string;
    status: string;
    details: string;
}

export interface ConnectionTypeChartProps {
    series: number [];
}

export interface UserOnboardingChartProps {
    category: string [][]
    series: number [];
}

export interface BngItem {
    bngId?: string;
    bngName: string;
    bngIp?: string;
    status?: string;
    [key: string]: any;
}

export interface BngPageDetails {
    page: number;
    size: number;
}

export interface BngSearchResponseModel {
    pageDetails: BngPageDetails;
    bngData: BngItem[];
}

export interface BngPingRequest {
    bngId: string;
}

export interface BngPingResponse {
    success?: boolean;
    status?: string;
    message?: string;
    data?: any;
    bngId?: string;
} 

export interface BNGListQueryParams {
    page?: number | string;
    size?: number | string;
    bngName?: string;
    status?: string;
    bngId?: string;
    bngIp?: string;
}

export interface BngListResponse {
    bngData: BngItem[];
}

export interface BngListApiResponse {
    success: boolean;
    message: string;
    data: BngItem[];
}
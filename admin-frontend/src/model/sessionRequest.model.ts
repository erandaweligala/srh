export interface SessionQueryModel {
    page: number,
    pageSize: number,
    username?: string;
    connectionStatus?: string;
    groupId?: string;
    startTime?: string;
    endTime?: string;
    sessionId?: string;
    uniqueId?:string;
    sortBy?: string;
    order?: string;
}
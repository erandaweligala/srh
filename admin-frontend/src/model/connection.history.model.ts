export interface ConnectionHistoryModel {
    uniqueId: String;
    sessionId: String;
    startTime: Date;
    endTime: Date;
    connectionStatus: string;
    userName: string;
    groupId?: string;
    usage: number;
}

export type ConnectionHistoryResponseModel = ConnectionHistoryModel[];
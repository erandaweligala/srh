export interface AuditLogsQueryModel {
    filterValues: FilterValues[],
    limit: number,
    offset: number,
}
export interface FilterValues {
    columnName: string,
    operation: string,
    value: string[]
}

export interface AuditLogsModel {
    id: number,
    activityId: string,
    activity: string,
    status: string,
    user: string,
    createdDateTime: string,
    actionId: string,
    activityType: string

}


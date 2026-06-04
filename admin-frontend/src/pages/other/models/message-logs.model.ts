export interface LogsQueryModel {
    page: number,
    page_size: number,
    start_time? : string,
    end_time? : string,
    action? : string,
    user_name?: string,
    request_id?: string,
    group_id?: string,
    result_code?: string,
    http_status?: string,
    description?: string,
    channel?: string,
    responseTime?: string,
    application?:string,
    opco?:string,
    success?: boolean,
}

export interface ReportDownloadRequestModel {
    createdBy: string,
    reportType: string,
    filterValues: FilterValues[]
}

export interface FilterValues {
    columnName: string,
    value: string | number
}
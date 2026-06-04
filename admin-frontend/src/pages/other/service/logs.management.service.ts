import axiosInstance from "../../../services/axios.service.ts";
import ApiCommonResponse from "../../../model/apiCommonResponse.ts";
import {LogsQueryModel, ReportDownloadRequestModel} from "../models/message-logs.model.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import showNotification from "../../../services/notification.service.tsx";
import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable.ts";
import {ReportDownloadQueryModel, ReportModel} from "../../reports/model/report.model.ts";
import {CommonApiResponseUMS} from "../../../model/commonApiResponse.ts";
import {AuditLogsModel, AuditLogsQueryModel} from "../models/audit-logs.model.ts";
import {ActionInfoResponseModel} from "../../subscriber-management/models/subscriber/action.info.model.ts";
import {toCamelCase} from "../../../helpers/helperFunctions.tsx";


export interface AllReportsTableDataModel {
    page: number;
    pageSize: number;
    totalRecords: number;
    reportDetails: ReportModel[];
}

export const reportDownloadRequestCreate = async (payload:ReportDownloadRequestModel): Promise<any> =>{
    try {
        console.log('payload',payload);
        const apiResponse = await axiosInstance.post<ApiCommonResponse<any>>(
            BackendEndpoints.REPORT_REQUEST_AUDIT_LOGS, payload
        );
        if (apiResponse.data.success) {
            showNotification("SUCCESS",(apiResponse.data.message? apiResponse.data.message:"Report created successfully!"))
        }
        return apiResponse.data.message

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const reportDownloadRequestCreateSubscribers = async (payload:ReportDownloadRequestModel): Promise<any> =>{
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<any>>(
            BackendEndpoints.REPORT_REQUEST_SUBSCRIBERS, payload
        );
        if (apiResponse.data.success) {
            showNotification("SUCCESS",(apiResponse.data.message? apiResponse.data.message:"Report created successfully!"))
        }
        return apiResponse.data.message

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const reportDownloadRequestProducts = async (payload:ReportDownloadRequestModel): Promise<any> =>{
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<any>>(
            BackendEndpoints.REPORT_REQUEST_PRODUCTS, payload
        );
        if (apiResponse.data.success) {
            showNotification("SUCCESS",(apiResponse.data.message? apiResponse.data.message:"Report created successfully!"))
        }
        return apiResponse.data.message

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const reportDownloadRequestMessageLogs = async (payload:ReportDownloadRequestModel): Promise<any> =>{
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<any>>(
            BackendEndpoints.REPORT_REQUEST_MESSAGE, payload
        );
        if (apiResponse.data.success) {
            showNotification("SUCCESS",(apiResponse.data.message? apiResponse.data.message:"Report created successfully!"))
        }
        return apiResponse.data.message

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const reportDownloadRequestSessionHistory = async (payload:ReportDownloadRequestModel): Promise<any> =>{
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<any>>(
            BackendEndpoints.REPORT_REQUEST_SESSION, payload
        );
        if (apiResponse.data.success) {
            showNotification("SUCCESS",(apiResponse.data.message? apiResponse.data.message:"Report created successfully!"))
        }
        return apiResponse.data.message

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const downloadReportData = async (id: string): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.get<ApiCommonResponse<any>>(
            BackendEndpoints.DOWNLOAD_REPORT ,
            {
                params: { id },
                timeout: 60000
            }
        );
        return apiResponse.data.data

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getAllReports = async (payload:ReportDownloadQueryModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<AllReportsTableDataModel>>(
            BackendEndpoints.REPORT_DATA, payload
        );

        return apiResponse.data.data

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getAuditLogs = async (
    queryParams: AuditLogsQueryModel
): Promise<CommonApiResponseUMS<AuditLogsModel> | null> => {
    try {
        const url = BackendEndpoints.GET_AUDIT_LOGS;

        const apiResponse = await axiosInstance.post<CommonApiResponseUMS<AuditLogsModel>>(
            url,
            queryParams,
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getMessageLogs = async (queryParams:LogsQueryModel): Promise<ActionInfoResponseModel | null> => {
    try {
        const url = BackendEndpoints.GET_MESSAGE_LOGS;

        const filteredParams: any = {
            page: queryParams.page,
            page_size: queryParams.page_size
        };
        Object.keys(queryParams).forEach((key) => {
            const value = queryParams[key as keyof LogsQueryModel];
            // Skip required fields (already added)
            if (key === 'page' || key === 'page_size') return;
            // Include the value if it's not undefined, null, or empty string
            if (value !== undefined && value !== null && value !== '') {
                filteredParams[key] = value;
            }
        });

        const apiResponse = await axiosInstance.get<ApiCommonResponse<ActionInfoResponseModel>>(url,
            {
                params: filteredParams
            });
        const responseData = apiResponse.data.data;
        return responseData ? toCamelCase(responseData) : null;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getErrorLogs = async (queryParams:LogsQueryModel): Promise<ActionInfoResponseModel | null> => {
    try {
        const url = BackendEndpoints.GET_ERROR_LOGS;

        const filteredParams: any = {
            page: queryParams.page,
            page_size: queryParams.page_size
        };
        Object.keys(queryParams).forEach((key) => {
            const value = queryParams[key as keyof LogsQueryModel];
            // Skip required fields (already added)
            if (key === 'page' || key === 'page_size') return;
            // Include the value if it's not undefined, null, or empty string
            if (value !== undefined && value !== null && value !== '') {
                filteredParams[key] = value;
            }
        });

        const apiResponse = await axiosInstance.get<ApiCommonResponse<ActionInfoResponseModel>>(url,
            {
                params: filteredParams
            });
        const responseData = apiResponse.data.data;
        return responseData ? toCamelCase(responseData) : null;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}
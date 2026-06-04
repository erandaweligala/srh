import BaseResponse from "../model/baseResponse.ts";
import {ConnectionHistoryResponseModel} from "../model/connection.history.model.ts";
import BackendEndpoints from "../constants/backendEndpoints.ts";
import axiosInstance from "./axios.service.ts";
import showNotification from "./notification.service.tsx";
import {getErrorHumanReadableMessage} from "../helpers/backendErrorsHumanReadable.ts";
import {SessionDetailsResponseModel} from "../model/session.details.model.ts";
import {SessionQueryModel} from "../model/sessionRequest.model.ts";
import ApiCommonResponse from "../model/apiCommonResponse.ts";

export const getConnectionHistory = async (queryParams: SessionQueryModel): Promise<BaseResponse<ConnectionHistoryResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_CONNECTION_HISTORY}`;

        const apiResponse = await axiosInstance.get<BaseResponse<ConnectionHistoryResponseModel>>(url, { params: {
                ...queryParams,
                sort_by: queryParams.sortBy || 'startTime',
                sortBy: queryParams.sortBy || 'startTime',
                order: queryParams.order || 'desc',
                sortDir: queryParams.order || 'desc'
            } });

        return apiResponse.data;
    } catch (error){
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getConnectionHistoryDetails = async (
    uniqueId: string): Promise<BaseResponse<SessionDetailsResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_CONNECTION_HISTORY_DETAIL}/${encodeURIComponent(uniqueId)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<SessionDetailsResponseModel>>(url);

        if (apiResponse.data && Array.isArray(apiResponse.data.data)) {
            apiResponse.data.data.sort((a, b) => new Date(String(b.dateTime)).getTime() - new Date(String(a.dateTime)).getTime());
        }

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getSessionHistory = async (queryParams: SessionQueryModel): Promise<BaseResponse<ConnectionHistoryResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_SESSION_HISTORY}`;

        const apiResponse = await axiosInstance.get<BaseResponse<ConnectionHistoryResponseModel>>(url, { params: {
                ...queryParams,
                sort_by: queryParams.sortBy || 'startTime',
                sortBy: queryParams.sortBy || 'startTime',
                order: queryParams.order || 'desc',
                sortDir: queryParams.order || 'desc'
            } });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getSessionHistoryDetails = async (
    uniqueId: string): Promise<BaseResponse<SessionDetailsResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_SESSION_HISTORY_DETAIL}/${encodeURIComponent(uniqueId)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<SessionDetailsResponseModel>>(url);

        if (apiResponse.data && Array.isArray(apiResponse.data.data)) {
            apiResponse.data.data.sort((a, b) => new Date(String(b.dateTime)).getTime() - new Date(String(a.dateTime)).getTime());
        }

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const terminateSession = async (
    userName: string,
    sessionId: string
): Promise<any> => {
    try {
        const url = `${BackendEndpoints.TERMINATE_SESSION}/${encodeURIComponent(userName)}/${encodeURIComponent(sessionId)}`;

        const apiResponse = await axiosInstance.patch<ApiCommonResponse<any>>(url);

        return apiResponse.data.data;
    } catch (error) {
        console.log("Error terminating session:", error);
        throw error;
    }
}

export const terminateConnection = async (
    userName: string,
    sessionId: string
): Promise<any> => {
    try {
        const url = `${BackendEndpoints.TERMINATE_CONNECTION}/${encodeURIComponent(userName)}/${encodeURIComponent(sessionId)}`;

        const apiResponse = await axiosInstance.patch<ApiCommonResponse<any>>(url);

        return apiResponse.data.data;
    } catch (error) {
        console.log("Error terminating session:", error);
        throw error;
    }
}
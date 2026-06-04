import CommonApiRequest from "../../../model/commonApiRequest.ts";
import axiosInstance from "../../../services/axios.service.ts";
import CommonApiResponse from "../../../model/commonApiResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import showNotification from "../../../services/notification.service.tsx";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable.ts";
import { RecentActivitiesResponseModel } from "../models/recentActivities.model.ts";
import { UserSummaryModel } from "../models/userSummary.model.ts";
import { OnboardingListResponse } from "../models/onboardingList.model.ts";
import BaseResponse from "../../../model/baseResponse.ts";
import { AccountingSummaryModel, UserStatusSummaryModel } from "../models/accountingSummary.model.ts";
import { BNGListQueryParams, BngSearchResponseModel, BngPingResponse, BngListApiResponse } from "../models/Home.model.ts";

export const getRecentActivities = async (
    requestBody: CommonApiRequest<null>,
    pageNo: string,
    pageSize: string
): Promise<RecentActivitiesResponseModel> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponse<RecentActivitiesResponseModel>>(
            BackendEndpoints.API_VERSION + BackendEndpoints.GET_RECENT_ACTIVITIES,
            requestBody,
            {
                params: {
                    pageNo,
                    pageSize,
                    sortBy: "activityId",
                    sortDir: 'desc'
                }
            }
        );

        return apiResponse.data.responseBody;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getOnboardingList = async (
    requestBody: CommonApiRequest<null>): Promise<OnboardingListResponse> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponse<OnboardingListResponse>>(
            BackendEndpoints.API_VERSION + BackendEndpoints.GET_ONBOARDING_LIST,
            requestBody
        );

        return apiResponse.data.responseBody;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getUserSummary = async (
    requestBody: CommonApiRequest<null>): Promise<UserSummaryModel> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponse<UserSummaryModel>>(
            BackendEndpoints.API_VERSION + BackendEndpoints.GET_USER_SUMMARY,
            requestBody
        );

        return apiResponse.data.responseBody;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getAccountingSummary = async (): Promise<BaseResponse<AccountingSummaryModel>> => {
    try {
        const url = BackendEndpoints.GET_ACCOUNTING_SUMMARY;
        const apiResponse = await axiosInstance.get<BaseResponse<AccountingSummaryModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getUserStatusSummary = async (): Promise<BaseResponse<UserStatusSummaryModel>> => {
    try {
        const url = BackendEndpoints.GET_USER_STATUS_SUMMARY;
        const apiResponse = await axiosInstance.get<BaseResponse<UserStatusSummaryModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}


export const getBNGSearch = async (params: BNGListQueryParams

): Promise<BaseResponse<BngSearchResponseModel> | null> => {
    try {
        const url = BackendEndpoints.SEARCH_BNG;

        // axios params option automatically serializes object to query string
        const apiResponse = await axiosInstance.get<BaseResponse<BngSearchResponseModel>>(url, { params: params });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const pingBng = async (bngId: string): Promise<BngPingResponse> => {
    try {
        const url = BackendEndpoints.PING_BNG;
        const apiResponse = await axiosInstance.post<BngPingResponse>(url, { bngId }, { timeout: 60000 });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getBNGListAll = async (): Promise<BngListApiResponse> => {
    try {
        const url = BackendEndpoints.LIST_BNG;
        console.log("Calling URL:", url);
        const apiResponse = await axiosInstance.get<BngListApiResponse>(url);
        console.log("Response data:", apiResponse.data);
        return apiResponse.data;
    } catch (error) {
        console.error("Error fetching BNG list:", error);
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}
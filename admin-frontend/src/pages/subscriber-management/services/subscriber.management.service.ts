import axiosInstance from "../../../services/axios.service.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import showNotification from "../../../services/notification.service.tsx";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable.ts";
import { SubscriberResponseModel } from "../models/subscriber/subscribers.model.ts";
import { SubscriberCreationModel } from "../models/subscriber/subscriber.creation.model.ts";
import ApiCommonResponse from "../../../model/apiCommonResponse.ts";
import { SubscriberUpdateModel } from "../models/subscriber/subscriber.update.model.ts";
import { toCamelCase, toSnakeCase } from "../../../helpers/helperFunctions.tsx";
import { ActionInfoResponseModel } from "../models/subscriber/action.info.model.ts";
import BaseResponse from "../../../model/baseResponse.ts";
import {
    NewServiceInfoModel,
    ServiceInfoResponseModel,
    ServiceInfoUpdateModel
} from "../models/subscriber/service.info.model.ts";
import { ServiceDetailsResponseModel } from "../models/subscriber/service.details.model.ts";
import { LogsQueryModel } from "../../other/models/message-logs.model.ts";


interface GetAllSubscribersParams {
    page: number;
    pageSize: number;
    userName?: string;
    groupId?: string;
    status?: number;
    subscription?: number;
    sortBy?: string;
    order?: string;
}
export const getAllSubscribers = async ({
    page,
    pageSize,
    userName,
    groupId,
    status,
    subscription,
    sortBy,
    order
}: GetAllSubscribersParams): Promise<SubscriberResponseModel | null> => {
    try {
        const url = BackendEndpoints.GET_USER_LIST;

        const resolvedSortBy = sortBy || 'createdTimestamp';
        const resolvedOrder = order || 'desc';
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            sort_by: resolvedSortBy,
            sortBy: resolvedSortBy,
            order: resolvedOrder,
            sortDir: resolvedOrder,
        };

        if (userName) params.user_name = userName;
        if (groupId) params.group_id = groupId;
        if (status !== undefined && status !== null) params.status = status;
        if (subscription !== undefined && subscription !== null) params.subscription = subscription;

        const apiResponse =
            await axiosInstance.get<ApiCommonResponse<SubscriberResponseModel>>(url, { params });

        return toCamelCase(apiResponse.data.data);
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const createNewSubscriber = async (
    requestBody: SubscriberCreationModel): Promise<{ userName: string }> => {
    try {
        const apiResponse = await axiosInstance.post<ApiCommonResponse<{ userName: string }>>(
            BackendEndpoints.CREATE_SUBSCRIBER,
            toSnakeCase(requestBody),
        );

        return toCamelCase(apiResponse.data.data);
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const updateSubscriber = async (
    requestBody: SubscriberUpdateModel): Promise<{ userName: string }> => {
    try {
        const userName: string = requestBody?.userName;
        const url = BackendEndpoints.UPDATE_SUBSCRIBER + '/' + encodeURIComponent(userName);

        const apiResponse = await axiosInstance.patch<ApiCommonResponse<{ userName: string }>>(
            url,
            toSnakeCase(requestBody),
        );

        return toCamelCase(apiResponse.data.data);
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}


export const deleteSubscriber = async (
    userName: string): Promise<ApiCommonResponse<null> | null> => {
    try {
        const url = BackendEndpoints.DELETE_SUBSCRIBER + '/' + encodeURIComponent(userName);

        const apiResponse = await axiosInstance.delete<ApiCommonResponse<null>>(url, {
            headers: { 'Content-Type': 'application/json' },
            data: {},
        });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}


export const getActionInfo = async (queryParams: LogsQueryModel): Promise<ActionInfoResponseModel | null> => {
    try {
        const url = BackendEndpoints.GET_ACTION_INFO;

        // Filter out empty values from query params (keep required fields: page, page_size)
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

export const getServiceInfo = async (opts: {
    page: number;
    pageSize: number;
    username: string;
    serviceId?: string;
    status?: string;
    planId?: string;
    planType?: string;
    isGroup?: boolean;
    recurringFlag?: boolean;
}): Promise<BaseResponse<ServiceInfoResponseModel> | null> => {
    try {
        const { page, pageSize, username, serviceId, status, planId, planType, isGroup, recurringFlag } = opts;
        const url = BackendEndpoints.GET_SERVICE_INFO;
        const params: Record<string, any> = {
            page,
            pageSize,
            sort_by: 'service_start_date',
            order: 'desc',
            ...(username ? { username } : {}),
            ...(serviceId ? { serviceId } : {}),
            ...(status ? { status } : {}),
            ...(planId ? { planId } : {}),
            ...(planType ? { planType } : {}),
            ...(isGroup === undefined ? {} : { isGroup }),
            ...(recurringFlag === undefined ? {} : { recurringFlag }),
        };

        const apiResponse = await axiosInstance.get<BaseResponse<ServiceInfoResponseModel>>(url, { params });

        return apiResponse.data;
    } catch (error) {
        console.log("error in getServiceInfo:", error);
        throw error;
    }
}

export const getServiceInfoDetails = async (
    serviceId: string): Promise<BaseResponse<ServiceDetailsResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_SERVICE_INFO_DETAIL}/${encodeURIComponent(serviceId)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<ServiceDetailsResponseModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createNewService = async (payload: NewServiceInfoModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.post<BaseResponse<any>>(
            BackendEndpoints.CREATE_NEW_SERVICE,
            payload,
        );
        showNotification("SUCCESS", apiResponse.data.message);
        return apiResponse.data.data;

    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }

}

export const deleteService = async (
    user_id: string,
    plan_id: string,
    request_id: string
): Promise<ApiCommonResponse<null> | null> => {
    try {
        const url = `${BackendEndpoints.DELETE_SERVICE}/${encodeURIComponent(user_id)}/${encodeURIComponent(plan_id)}/${encodeURIComponent(request_id)}`;
        const apiResponse = await axiosInstance.delete<ApiCommonResponse<null>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const updateService = async (
    requestBody: ServiceInfoUpdateModel,
    user_id: string,
    plan_id: string,
    request_id: string
): Promise<any> => {
    try {
        const url = BackendEndpoints.UPDATE_SERVICE + '/' + encodeURIComponent(user_id) + '/' + encodeURIComponent(plan_id) + '/' + encodeURIComponent(request_id);

        const apiResponse = await axiosInstance.patch<ApiCommonResponse<any>>(
            url,
            requestBody,
        );

        return apiResponse.data.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getNotificationTemplateList = async (): Promise<BaseResponse<[{ super_template_id: number, template_name: string }]>> => {
    try {
        const url = BackendEndpoints.GET_NOTIFICATIONS_LIST;
        const apiResponse = await axiosInstance.get<BaseResponse<[{ super_template_id: number, template_name: string }]>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}
import BaseResponse from "../../../model/baseResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import axiosInstance from "../../../services/axios.service.ts";
import showNotification from "../../../services/notification.service.tsx";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable.ts";
import { NotificationTemplatesResponse, NotificationTemplatesQueryParams, NotificationTemplateModel } from "../models/notification-template.model.ts";
import { NotificationTemplateCreationModel } from "../models/notification-template.creation.model.ts";
import { NotificationTemplateUpdateModel } from "../models/notification-template.update.model.ts";

export const getNotificationTemplates = async (params: NotificationTemplatesQueryParams

): Promise<BaseResponse<NotificationTemplatesResponse> | null> => {
    try {
        const url = BackendEndpoints.GET_NOTIFICATION_TEMPLATES;

        // axios params option automatically serializes object to query string
        const apiResponse = await axiosInstance.get<BaseResponse<NotificationTemplatesResponse>>(url, { params: params });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createNotificationTemplateRequest = async (
    reqBody: NotificationTemplateCreationModel
): Promise<BaseResponse<NotificationTemplateModel> | null> => {
    try {
        const url = BackendEndpoints.CREATE_NOTIFICATION_TEMPLATE;
        const apiResponse = await axiosInstance.post<BaseResponse<NotificationTemplateModel>>(url, reqBody);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const updateNotificationTemplateRequest = async (
    id: string,
    reqBody: NotificationTemplateUpdateModel
): Promise<BaseResponse<NotificationTemplateModel> | null> => {
    try {
        const url = `${BackendEndpoints.UPDATE_NOTIFICATION_TEMPLATE}/${id}`;
        const apiResponse = await axiosInstance.put<BaseResponse<NotificationTemplateModel>>(url, reqBody);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getNotificationTemplateRequest = async (
    id: number
): Promise<BaseResponse<NotificationTemplateModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_NOTIFICATION_TEMPLATE_DETAILS}/${id}`;
        const apiResponse = await axiosInstance.get<BaseResponse<NotificationTemplateModel>>(url);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}


import axiosInstance from "./axios.service";
import CommonApiResponse, {CommonApiResponseUMS} from "../model/commonApiResponse.ts";
import BackendEndpoints from "../constants/backendEndpoints";
import showNotification from "./notification.service";
import {getErrorHumanReadableMessage} from "../helpers/backendErrorsHumanReadable";
import {SettingsModel} from "../model/settings.model.ts";
import CommonApiRequest from "../model/commonApiRequest.ts";
import {MetaDataModel} from "../pages/user-management/models/roles/roles.model.ts";
import {commonHeaderUMS} from "../pages/user-management/services/user.management.service.ts";
import {PermissionModelRoles} from "../pages/user-management/models/permissions/permission.model.ts";

export const getAllRoles = async (): Promise<MetaDataModel[]> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<MetaDataModel[]>>(
            // BackendEndpoints.API_VERSION +
            BackendEndpoints.GET_ALL_ROLES_META_DATA, commonHeaderUMS
        );

        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}


export const getDefaultSettings = async (request: CommonApiRequest<{ category: string[] }>): Promise<SettingsModel> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponse<SettingsModel>>(
            BackendEndpoints.API_VERSION + BackendEndpoints.GET_SETTINGS,
            request
        );

        return apiResponse.data.responseBody;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const updateOTPConfigurations = async (request: CommonApiRequest<{
    configList: { configKey: string; configValue: string; }[]
}>): Promise<{
    requestId: string,
    timestamp: string,
    code: string,
    desc: string
}> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponse<{
            requestId: string,
            timestamp: string,
            code: string,
            desc: string
        }>>(
            BackendEndpoints.API_VERSION + BackendEndpoints.UPDATE_OTP_SETTINGS,
            request
        );

        return apiResponse.data.responseHeader;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getStatusMetaData = async (): Promise<MetaDataModel[]> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<MetaDataModel[]>>(
            // BackendEndpoints.API_VERSION +
            BackendEndpoints.GET_STATUS_META_DATA
        );

        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getPermissionMetaData  = async (): Promise<PermissionModelRoles[]> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<PermissionModelRoles[]>>(
            // BackendEndpoints.API_VERSION +
            BackendEndpoints.GET_PERMISSION_META_DATA, commonHeaderUMS
        );

        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}
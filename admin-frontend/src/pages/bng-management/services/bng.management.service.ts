import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import axiosInstance from "../../../services/axios.service.ts";
import showNotification from "../../../services/notification.service.tsx";
import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable.ts";
import ApiCommonResponse from "../../../model/apiCommonResponse.ts";
import {BngModel, BngResponseModel} from "../models/bng.model.ts";
import {BngQueryModel} from "../models/bngRequest.model.ts";

export const searchBng = async (queryParams: BngQueryModel): Promise<ApiCommonResponse<BngResponseModel> | null> => {
    try {
        const url = BackendEndpoints.SEARCH_BNG;
        const apiResponse = await axiosInstance.get<ApiCommonResponse<BngResponseModel>>(url, { params: queryParams });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createBng = async (
    requestBody: BngModel): Promise<ApiCommonResponse<BngModel>> => {
    try {
        const url = BackendEndpoints.CREATE_BNG;
        const apiResponse = await axiosInstance.post<ApiCommonResponse<BngModel>>(
            url,
            requestBody,
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const updateBng = async (
    requestBody: BngModel
): Promise<ApiCommonResponse<BngModel>> => {
    try {
        const bngId: string = requestBody?.bngId;
        const url = BackendEndpoints.UPDATE_BNG+'/' + encodeURIComponent(bngId);
        const apiResponse = await axiosInstance.put<ApiCommonResponse<BngModel>>(url, requestBody);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const getVendorConfigsList = async (): Promise<ApiCommonResponse<any> | null> => {
    try {
        const url = BackendEndpoints.GET_VENDOR_CONFIG_LIST;
        const apiResponse = await axiosInstance.get<ApiCommonResponse<any>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

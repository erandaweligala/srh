import axiosInstance from "../../../services/axios.service";
import { ConfigurationQueryParams, VendorConfigSearchResponseData,VendorConfigData, EntityMetadataResponse } from "../models/configuration.model";
import API_ENDPOINTS from "../../../constants/backendEndpoints";
import BaseResponse from "../../../model/baseResponse";
import showNotification from "../../../services/notification.service";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable";



export const getConfigurationsRequest = async (params: ConfigurationQueryParams

): Promise<BaseResponse<VendorConfigSearchResponseData> | null> => {
    try {
        const url = API_ENDPOINTS.SEARCH_VENDOR_CONFIGS;

        // axios params option automatically serializes object to query string
        const apiResponse = await axiosInstance.get<BaseResponse<VendorConfigSearchResponseData>>(url, { params: params });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createConfigurationRequest = async (data: any): Promise<BaseResponse<VendorConfigData> | null> => {
    try {
        const url = API_ENDPOINTS.CREATE_VENDOR_CONFIG;
        const apiResponse = await axiosInstance.post<BaseResponse<VendorConfigData>>(url, data);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const updateConfigurationRequest = async (data: any): Promise<BaseResponse<VendorConfigData> | null> => {
    try {
        const url = API_ENDPOINTS.UPDATE_VENDOR_CONFIG;
        const apiResponse = await axiosInstance.put<BaseResponse<VendorConfigData>>(url, data);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const deleteConfigurationRequest = async (id: number): Promise<BaseResponse<any> | null> => {
    try {
        const url = `${API_ENDPOINTS.DELETE_VENDOR_CONFIG}/${id}`;
        const apiResponse = await axiosInstance.delete<BaseResponse<any>>(url);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getEntityMetadataRequest = async (entity: string): Promise<BaseResponse<string[]> | null> => {
    try {
        const url = `${API_ENDPOINTS.GET_ENTITY_METADATA}/${entity}`;
        const apiResponse = await axiosInstance.get<EntityMetadataResponse>(url, {});
        // The API returns { data: [ "col1", "col2" ] }, so we map it to BaseResponse<string[]>
        return {
            success: apiResponse.data.success,
            message: apiResponse.data.message,
            data: apiResponse.data.data
        };
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}



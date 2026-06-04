import BaseResponse from "../../../model/baseResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import axiosInstance from "../../../services/axios.service.ts";
import showNotification from "../../../services/notification.service.tsx";
import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable.ts";
import {QosModel, QosResponseModel} from "../models/qos.model.ts";
import {QosCreationModel} from "../models/qos.creation.model.ts";

export const getQosProfiles = async (
    page: number,
    pageSize: number,
    id? : number,
    bngCode? : string,
): Promise<BaseResponse<QosResponseModel> | null> => {
    try {
        const url = BackendEndpoints.GET_QOS_PROFILES;
        const params: Record<string, any> = { pageNumber: page, pageElementCount: pageSize };
        if (id) params.id = id;
        if (bngCode) params.bngCode = bngCode;

        const apiResponse = await axiosInstance.get<BaseResponse<QosResponseModel>>(url, { params });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createQosProfile = async (
    requestBody: QosCreationModel): Promise<BaseResponse<QosModel>> => {
    try {
        const url = BackendEndpoints.CREATE_QOS_PROFILE;
        const apiResponse = await axiosInstance.post<BaseResponse<QosModel>>(
            url,
            requestBody,
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const editQosProfile = async (
    requestBody: QosModel
): Promise<BaseResponse<QosModel>> => {
    try {
        const url = BackendEndpoints.EDIT_QOS_PROFILE;
        const apiResponse = await axiosInstance.put<BaseResponse<QosModel>>(url, requestBody);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const deleteQosProfile = async (
    id: string): Promise<any> => {
    try {
        const url = BackendEndpoints.DELETE_QOS_PROFILE+'/' + encodeURIComponent(id);

        const apiResponse = await axiosInstance.delete<any>(url, {
            headers: { 'Content-Type': 'application/json' },
            data: {},
        });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}
import BaseResponse from "../../../model/baseResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import axiosInstance from "../../../services/axios.service.ts";
import showNotification from "../../../services/notification.service.tsx";
import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable.ts";
import {BucketModel, BucketResponseModel} from "../models/bucket.model.ts";
import {BucketCreationModel} from "../models/bucket.creation.model.ts";
import {BucketUpdateModel} from "../models/bucket.update.model.ts";

export const getBuckets = async (
    page: number,
    pageSize: number,
    bucketId? : string,
    bucketName? : string,
): Promise<BaseResponse<BucketResponseModel> | null> => {
    try {
        const url = BackendEndpoints.GET_BUCKETS;
        const params: Record<string, any> = { pageNumber: page, pageElementCount: pageSize };
        if (bucketId) params.bucketId = bucketId;
        if (bucketName) params.bucketName = bucketName;

        const apiResponse = await axiosInstance.get<BaseResponse<BucketResponseModel>>(url, { params });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createBucket = async (
    requestBody: BucketCreationModel): Promise<BaseResponse<BucketModel>> => {
    try {
        const url = BackendEndpoints.CREATE_BUCKET;
        const apiResponse = await axiosInstance.post<BaseResponse<BucketModel>>(
            url,
            requestBody,
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const editBucket = async (
    requestBody: BucketUpdateModel
): Promise<BaseResponse<BucketModel>> => {
    try {
        const url = BackendEndpoints.EDIT_BUCKET;
        const apiResponse = await axiosInstance.put<BaseResponse<BucketModel>>(url, requestBody);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const deleteBucket = async (
    id: string): Promise<any> => {
    try {
        const url = BackendEndpoints.DELETE_BUCKET+'/' + encodeURIComponent(id);

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
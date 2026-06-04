import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import axiosInstance from "../../../services/axios.service.ts";
import showNotification from "../../../services/notification.service.tsx";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable.ts";
import BaseResponse from "../../../model/baseResponse.ts";
import { PlansResponseModel } from "../models/plans.model.ts";
import { ProductDetailsResponseModel } from "../models/product.details.model.ts";
import { PlanCreationModel } from "../models/plan.creation.model.ts";
import { PlanUpdateModel } from "../models/plan.update.model.ts";
import { PlansQueryModel } from "../models/planRequest.model.ts";
import { BucketModel } from "../../master-data/models/bucket.model.ts";
import { QosModel } from "../../master-data/models/qos.model.ts";
import { PendingApprovalResponseModel, PendingApprovalRequestModel } from "../models/pendingApproval.model.ts";
import { ApprovalConfigModel } from "../models/approvalConfigs.model.ts";
import { ApprovalHistoryModel } from "../models/approvalHistory.model.ts";


export const getPlansInfo = async (
    queryParams: PlansQueryModel

): Promise<BaseResponse<PlansResponseModel> | null> => {
    try {
        const url = BackendEndpoints.GET_PLANS;

        const apiResponse = await axiosInstance.get<BaseResponse<PlansResponseModel>>(url, { params: queryParams });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getProductDetails = async (
    id: string): Promise<BaseResponse<ProductDetailsResponseModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_PRODUCT_DETAILS}/${encodeURIComponent(id)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<ProductDetailsResponseModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const createNewPlan = async (
    requestBody: PlanCreationModel): Promise<BaseResponse<any>> => {
    try {
        const url = BackendEndpoints.CREATE_NEW_PLAN;
        const apiResponse = await axiosInstance.post<BaseResponse<any>>(
            url,
            requestBody,
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getBucketsList = async (): Promise<BaseResponse<[{ bucketId: string, bucketName: string }]>> => {
    try {
        const url = BackendEndpoints.GET_BUCKETS_LIST;
        const apiResponse = await axiosInstance.get<BaseResponse<[{ bucketId: string, bucketName: string }]>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getPlansList = async (): Promise<BaseResponse<[{ planId: string, planName: string }]>> => {
    try {
        const url = BackendEndpoints.GET_PLANS_LIST;
        const apiResponse = await axiosInstance.get<BaseResponse<[{ planId: string, planName: string }]>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const editNewPlan = async (
    id: string,
    requestBody: PlanUpdateModel
): Promise<ProductDetailsResponseModel> => {
    try {
        const url = `${BackendEndpoints.EDIT_NEW_PLAN}/${encodeURIComponent(id)}`;
        const apiResponse = await axiosInstance.put<ProductDetailsResponseModel>(url, requestBody);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const deletePlan = async (
    planId: string): Promise<any> => {
    try {
        const url = BackendEndpoints.DELETE_NEW_PLAN + '/' + encodeURIComponent(planId);

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

export const deleteBucket = async (
    id: string): Promise<any> => {
    try {
        const url = BackendEndpoints.DELETE_PLAN_BUCKET + '/' + encodeURIComponent(id);

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

export const getBucketDetails = async (
    id: number): Promise<BaseResponse<BucketModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_BUCKET_DETAILS}/${encodeURIComponent(id)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<BucketModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getQosDetails = async (
    id: number): Promise<BaseResponse<QosModel> | null> => {
    try {
        const url = `${BackendEndpoints.GET_QOS_PROFILE_BY_ID}/${encodeURIComponent(id)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<QosModel>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const approvePlan = async (
    planId: string,
    comment: string
): Promise<BaseResponse<any>> => {
    try {
        const url = `${BackendEndpoints.APPROVE_PLAN}/${encodeURIComponent(planId)}`;
        const apiResponse = await axiosInstance.post<BaseResponse<any>>(
            url,
            {
                planId: planId,
                comments: comment
            }
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const rejectPlan = async (
    planId: string,
    comment: string
): Promise<BaseResponse<any>> => {
    try {
        const url = `${BackendEndpoints.REJECT_PLAN}/${encodeURIComponent(planId)}`;
        const apiResponse = await axiosInstance.post<BaseResponse<any>>(
            url,
            {
                planId: planId,
                comments: comment
            }
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const submitRequestApproval = async (
    planId: string
): Promise<BaseResponse<any>> => {
    try {
        const url = `${BackendEndpoints.SUBMIT_REQUEST_APPROVAL}/${encodeURIComponent(planId)}`;
        const apiResponse = await axiosInstance.post<BaseResponse<any>>(
            url,
            { planId: planId }
        );

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getPendingApprovals = async (queryParams: PendingApprovalRequestModel): Promise<BaseResponse<PendingApprovalResponseModel> | null> => {
    try {
        const url = BackendEndpoints.GET_PENDING_APPROVALS;
        const apiResponse = await axiosInstance.get<BaseResponse<PendingApprovalResponseModel>>(url, { params: queryParams });

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
}

export const getApprovalConfigs = async (): Promise<BaseResponse<ApprovalConfigModel[]> | null> => {
    try {
        const url = BackendEndpoints.GET_APPROVAL_CONFIGS;
        const apiResponse = await axiosInstance.get<BaseResponse<ApprovalConfigModel[]>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

export const getApprovalHistory = async (
    planId: string
): Promise<BaseResponse<ApprovalHistoryModel[]> | null> => {
    try {
        const url = `${BackendEndpoints.GET_APPROVAL_HISTORY}/${encodeURIComponent(planId)}`;
        const apiResponse = await axiosInstance.get<BaseResponse<ApprovalHistoryModel[]>>(url);

        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw error;
    }
};

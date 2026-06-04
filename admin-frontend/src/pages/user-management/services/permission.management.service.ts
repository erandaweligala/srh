import axiosInstance from "../../../services/axios.service.ts";
import {CommonApiResponseUMS} from "../../../model/commonApiResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import showNotification from "../../../services/notification.service.tsx";
import { getErrorHumanReadableMessage } from "../../../helpers/backendErrorsHumanReadable.ts";
import {
    MenuToComponentModel, PermissionByComponentIdAndMenuId, PermissionByComponentIdModel,
    PermissionListResponseModel,
    PermissionQueryParams, PermissionsEditModel, PermissionViewModel
} from "../models/permissions/permission.model.ts";
import {commonHeaderUMS} from "./user.management.service.ts";

export const searchAllPermissions = async (params: PermissionQueryParams): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<PermissionListResponseModel[]>>(
            BackendEndpoints.PERMISSION_API,
            {
                params: params,
                headers: {
                    tenantId: 1
                }
            }

        );
        return [apiResponse.data.responseData, apiResponse.data.result.pageDetail];
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getMenuToComponentData = async (): Promise<MenuToComponentModel[]> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<MenuToComponentModel[]>>(
            BackendEndpoints.MENU_TO_COMPONENT,commonHeaderUMS
        );

        return apiResponse.data.responseData;

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getPermissionByComponentId = async (queryParams:PermissionByComponentIdAndMenuId): Promise<PermissionByComponentIdModel> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<PermissionByComponentIdModel>>(
            BackendEndpoints.PERMISSION_BY_COMPONENT,
            {
                params: queryParams
            }
        );

        return apiResponse.data.responseData;

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const postCreatePermissionData = async (payload: PermissionsEditModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponseUMS<any>>(
            BackendEndpoints.CREATE_PERMISSION,
            payload,
            commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data.responseData;
    } catch (error: any) {
        if(error.response.data.message === "Name already Exists"){
            showNotification("ERROR", "Name already Exists");
        }else{
            showNotification("ERROR", getErrorHumanReadableMessage(error));
        }
        throw new Error();
    }
}

export const editPermissionData = async (payload: PermissionsEditModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.patch<CommonApiResponseUMS<any>>(
            BackendEndpoints.EDIT_PERMISSION,
            payload,
            commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data.responseData;
    } catch (error: any) {
        if(error.response.data.message === "Name already Exists"){
            showNotification("ERROR", "Name already Exists");
        }else{
            showNotification("ERROR", getErrorHumanReadableMessage(error));
        }
        throw new Error();
    }
}

export const getSinglePermissionData = async (permissionId:string): Promise<PermissionViewModel> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<PermissionViewModel>>(
            BackendEndpoints.SINGLE_PERMISSION + "/" + permissionId,
        );

        return apiResponse.data.responseData;

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}
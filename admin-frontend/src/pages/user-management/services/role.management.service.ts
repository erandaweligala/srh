import axiosInstance from "../../../services/axios.service.ts";
import {CommonApiResponseUMS} from "../../../model/commonApiResponse.ts";
import BackendEndpoints from "../../../constants/backendEndpoints.ts";
import showNotification from "../../../services/notification.service.tsx";
import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable.ts";
import {RoleCreateModel} from "../models/roles/roleCreate.model.ts";
import {RoleUpdateModel} from "../models/roles/roleUpdate.model.ts";
import {RolesSearchRequestModel} from "../models/roles/rolesSearchRequest.model.ts";
import {RoleResponse, RoleViewModel} from "../models/roles/roles.model.ts";
import {commonHeaderUMS} from "./user.management.service.ts";

export const createNewRole = async (request: RoleCreateModel): Promise<{roleId: string}> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponseUMS<{roleId: string}>>(
            BackendEndpoints.CREATE_ROLE,
            request, commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const updateExistingRole = async (request: RoleUpdateModel): Promise<{roleId: string}> => {
    try {
        const apiResponse = await axiosInstance.patch<CommonApiResponseUMS<{roleId: string}>>(
            BackendEndpoints.UPDATE_ROLE,
            request, commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}
//
// export const deleteRole = async (request: CommonApiRequest<{roleId: string, roleName: string}>): Promise<{roleId: string}> => {
//     try {
//         const apiResponse = await axiosInstance.post<CommonApiResponse<{roleId: string}>>(
//             BackendEndpoints.API_VERSION + BackendEndpoints.DELETE_EXISTING_ROLE,
//             request
//         );
//
//         return apiResponse.data.responseBody;
//     } catch (error) {
//         showNotification("ERROR", getErrorHumanReadableMessage(error));
//         throw new Error();
//     }
// }

export const searchAllRoles = async (params: RolesSearchRequestModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<RoleResponse[]>>(
            BackendEndpoints.SEARCH_ALL_ROLE,
            {
                params:params,
                headers:{
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

export const getSingleRoleData = async (roleId:string): Promise<RoleViewModel> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<RoleViewModel>>(
            BackendEndpoints.GET_SINGLE_ROLE + "/" + roleId, commonHeaderUMS
        );

        return apiResponse.data.responseData

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}
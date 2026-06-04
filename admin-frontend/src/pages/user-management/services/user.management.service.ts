import {getErrorHumanReadableMessage} from "../../../helpers/backendErrorsHumanReadable";
import  {CommonApiResponseUMS} from "../../../model/commonApiResponse.ts";
import axiosInstance from "../../../services/axios.service";
import showNotification from "../../../services/notification.service";
import BackendEndpoints from "../../../constants/backendEndpoints";
import {UserCreationModel} from "../models/user/user.creation.model.ts";
import {UserUpdateModel} from "../models/user/user.update.model.ts";
import {UsersSearchRequestModel} from "../models/user/usersSearchRequest.model.ts";
import {UsersModel} from "../models/user/users.model.ts";
export const commonHeaderUMS = {
    headers:{
        tenantId: 1
    }
}
export const createNewUserRequest = async (requestBody: UserCreationModel): Promise<{ userId: string }> => {
    try {
        const apiResponse = await axiosInstance.post<CommonApiResponseUMS<{ userId: string }>>(
            // BackendEndpoints.API_VERSION +
            BackendEndpoints.CREATE_NEW_USER,
            requestBody, commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data.responseData;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const updateUserRequest = async (requestBody: UserUpdateModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.patch<CommonApiResponseUMS<any>>(
            // BackendEndpoints.API_VERSION +
            BackendEndpoints.UPDATE_USER,
            requestBody,commonHeaderUMS
        );
        showNotification("SUCCESS", apiResponse.data.result.resultDescription);
        return apiResponse.data;
    } catch (error) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getSingleUserData = async (userId:string): Promise<UserUpdateModel> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<UserUpdateModel>>(
            BackendEndpoints.SINGLE_USER_DETAILS + "/" + userId
        );
        return apiResponse.data.responseData

    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}


export const searchAllUsers = async (params: UsersSearchRequestModel): Promise<any> => {
    try {
        const apiResponse = await axiosInstance.get<CommonApiResponseUMS<UsersModel[]>>(
            BackendEndpoints.SEARCH_ALL_USERS,
            {
                params: params,
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

// export const deleteUserAccount = async (
//     requestBody: CommonApiRequest<{ userId: string }>): Promise<{ userId: string }> => {
//     try {
//         const apiResponse = await axiosInstance.post<CommonApiResponse<{ userId: string }>>(
//             BackendEndpoints.API_VERSION + BackendEndpoints.DELETE_USER,
//             requestBody,
//         );
//
//         return apiResponse.data.responseBody;
//     } catch (error) {
//         showNotification("ERROR", getErrorHumanReadableMessage(error));
//         throw new Error();
//     }
// }






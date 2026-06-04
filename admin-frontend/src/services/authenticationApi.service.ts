import axiosInstance from "./axios.service";
import BackendEndpoints from "../constants/backendEndpoints";
import showNotification from "./notification.service";
import {getErrorHumanReadableMessage} from "../helpers/backendErrorsHumanReadable";
import ApiCommonResponse from "../model/apiCommonResponse.ts";
import BaseResponse from "../model/baseResponse.ts";

export const getLoginUrl = async (): Promise<string> => {
    try {
        const apiResponse = await axiosInstance.get<ApiCommonResponse<{ url: string }>>(
            BackendEndpoints.GET_AD_LOGIN_URL
        );
        console.log('res',apiResponse.data);
        return apiResponse.data.data.url;
    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getAccessTokenUsingTempToken = async (tempToken: string): Promise<string> => {
    try {
        const apiResponse = await axiosInstance.post<BaseResponse<{ accessToken: string }>>(
            BackendEndpoints.GET_ACCESS_TOKEN_FROM_TEMP_TOKEN,
            {tempToken}
        );
        return apiResponse.data.data.accessToken;
    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}


export const logout = async (): Promise<any> => {
    try {
        await axiosInstance.delete<any>(
            BackendEndpoints.LOGOUT
        );
    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
        throw new Error();
    }
}

export const getNewAccessToken = async (): Promise<string> => {
    try {
        const apiResponse = await axiosInstance.get<BaseResponse<{ accessToken: string }>>(
            BackendEndpoints.GET_NEW_ACCESS_TOKEN_FROM_CURRENT_ACCESS_TOKEN
        );
        return apiResponse.data.data.accessToken;
    } catch (error: any) {
        throw new Error(getErrorHumanReadableMessage(error));
    }
}
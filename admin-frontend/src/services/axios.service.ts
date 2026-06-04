import Axios from "axios";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { BehaviorSubject } from "rxjs";
import store from "../stores/mainStore";
import { LocalStorageConstants } from "../constants/localStorage";
import {
    logoutAndRedirectToSessionExpirePage,
    mainLoginHandling,
    setIdleLogoutTimer
} from "./authenticationLogic.service";
import API_ENDPOINTS from "../constants/backendEndpoints";
import { getNewAccessToken } from "./authenticationApi.service";
// import formatDateTime from "../helpers/dateTimeForamtter";
// import BackendEndpoints from "../constants/backendEndpoints.ts";

export const pendingApiCalls$ = new BehaviorSubject<number>(0);

const loadingSpinnerExcludeUrls = [
    API_ENDPOINTS.GET_NEW_ACCESS_TOKEN_FROM_CURRENT_ACCESS_TOKEN,
    API_ENDPOINTS.GET_ACCOUNTING_SUMMARY
];

const channelHeaderRequiredUrls = [
    API_ENDPOINTS.GET_USER_LIST,
    API_ENDPOINTS.CREATE_SUBSCRIBER,
    API_ENDPOINTS.UPDATE_SUBSCRIBER,
    API_ENDPOINTS.DELETE_SUBSCRIBER,
    API_ENDPOINTS.DELETE_SERVICE,
    API_ENDPOINTS.UPDATE_SERVICE,
    API_ENDPOINTS.GET_SERVICE_INFO,
    API_ENDPOINTS.CREATE_NEW_SERVICE,
    API_ENDPOINTS.GET_USER_STATUS_SUMMARY
];

// const responseHeaderExcludeUrls: string[] = [
//     BackendEndpoints.API_VERSION + BackendEndpoints.UPLOAD_BULK_FAQ
// ];

// mascom dev : https://dev-selfcareadmin.mascom.bw/selfcare-admin-fe-admin-sc-fe/
// mascom qa : https://qa-selfcareadmin.mascom.bw/selfcare-admin-fe-admin-sc-fe/
// huawei dev : https://myadldev.adl.lk/selfcare-admin-fe-admin-sc-fe/

// const getBaseUrl = () => {
//     return "https://ingressdev.helloallworld.work.gd/"
//     //return "http://localhost:3004"
//     // const hostname = window.location.hostname;
//     // console.log("env Hostname: ", hostname)
//     //
//     // switch (hostname) {
//     //     case "selfcareadmin.mascom.bw":
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT_PROD;
//     //     case "qa-selfcareadmin.mascom.bw":
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT_QA;
//     //     case "dev-selfcareadmin.mascom.bw":
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT_DEV;
//     //     case "stg-selfcareadmin.mascom.bw":
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT_STG;
//     //     case "localhost":
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT;
//     //     default:
//     //         return import.meta.env.VITE_REACT_APP_AUTH_END_POINT_DEV;
//     // }
// };

//changes axios settings
const axiosInstance: AxiosInstance = Axios.create({
    baseURL: '',
    timeout: 10000
});

let setTokenInterceptorId: number;
let refreshTokenPromise: Promise<string> | null = null;

export const setTokenInterceptor = () => {

    axiosInstance.interceptors.request.eject(setTokenInterceptorId);

    setTokenInterceptorId = axiosInstance.interceptors.request.use(async (requestConfiguration) => {

        if (store.getState().auth.isUserLogin) {

            if (requestConfiguration && requestConfiguration.url && !requestConfiguration.url?.includes(API_ENDPOINTS.GET_NEW_ACCESS_TOKEN_FROM_CURRENT_ACCESS_TOKEN)) {

                const localStorageToken = localStorage.getItem(LocalStorageConstants.ACCESS_TOKEN);

                if (store.getState().auth.accessToken !== localStorageToken) {
                    if (localStorageToken) {
                        mainLoginHandling(localStorageToken);
                    } else {
                        setTimeout(() => {
                            logoutAndRedirectToSessionExpirePage();
                        }, 100)
                        throw new axios.Cancel('Cancel API Request By Application');
                    }
                }

                const nowTimeInSeconds = Math.floor(Date.now() / 1000); // Seconds
                const tokenExpirationTime = store.getState().auth.decodedToken!.exp!; // Seconds

                if (nowTimeInSeconds > tokenExpirationTime) {
                    logoutAndRedirectToSessionExpirePage();
                    throw new axios.Cancel("Token Is Expired");
                }
                
                // Refresh token logic
                if (tokenExpirationTime - nowTimeInSeconds < 300) {
                    if (!refreshTokenPromise) {
                        refreshTokenPromise = getNewAccessToken().then((newToken) => {
                            mainLoginHandling(newToken);
                            return newToken;
                        }).catch(() => {
                            logoutAndRedirectToSessionExpirePage();
                            throw new axios.Cancel("Token Is Expired");
                        }).finally(() => {
                            refreshTokenPromise = null;
                        });
                    }
                    await refreshTokenPromise;
                }

            }

            if (requestConfiguration && requestConfiguration.headers) {
                requestConfiguration.headers['Authorization'] = `Bearer ${store.getState().auth.accessToken}`;
            }

            // to avoid loop condition
            if (requestConfiguration && requestConfiguration.url && !requestConfiguration.url?.includes(API_ENDPOINTS.LOGOUT)) {
                setIdleLogoutTimer(false);
            }
        }

        return requestConfiguration;
    });

}


export const clearTokenInterceptors = () => {
    axiosInstance.interceptors.request.clear();
}

/**
 * This response interceptor is used to Logout user if 403 or 401 response received from any API CALL
 * */
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const responseUrl = error.response?.request?.responseURL || "";
        if (
            responseUrl.includes(API_ENDPOINTS.LOGOUT) ||
            responseUrl.includes(API_ENDPOINTS.GET_SETTINGS) ||
            responseUrl.includes(API_ENDPOINTS.GET_NEW_ACCESS_TOKEN_FROM_CURRENT_ACCESS_TOKEN) ||
            responseUrl.includes(API_ENDPOINTS.APPROVE_PLAN) ||
            responseUrl.includes(API_ENDPOINTS.REJECT_PLAN)
        ) {
            return Promise.reject(error);
        } else if (
            (error.response && error.response.status) &&
            (error.response.status === 403 || error.response.status === 401)
        ) {
            console.log('Unauthorized Response Received. Logout the User');
            logoutAndRedirectToSessionExpirePage();
        }
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.request.use((request) => {
    if (request.headers && !request.headers['Authorization']) {
        request.headers['pre-auth'] = import.meta.env.VITE_REACT_APP_AUTH_KEY;
    }

    if (request.url && channelHeaderRequiredUrls.some(url => request.url?.includes(url))) {
        request.headers['channel'] = 'SRH';
    }

    if (request && request.url && !isLoadingSpinnerExcludeUrl(request.url)) {
        pendingApiCalls$.next(pendingApiCalls$.getValue() + 1);
        request = setRequestHeaderData(request);
    }
    return request;
});


axiosInstance.interceptors.response.use(
    (response) => {
        if (response && response.config && response.config.url && !isLoadingSpinnerExcludeUrl(response.config.url)) {
            pendingApiCalls$.next(pendingApiCalls$.getValue() - 1);
        }
        return response;
    },
    (error) => {
        if (error && error.config && error.config.url && !isLoadingSpinnerExcludeUrl(error.config.url)) {
            pendingApiCalls$.next(pendingApiCalls$.getValue() - 1);
        }
        return Promise.reject(error);
    }
);

const setRequestHeaderData = (request: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig<any> => {
    // if (request && request.data && request.url && !responseHeaderExcludeUrls.includes(request.url)) {
    //     //TODO: Update msisdn and userId
    //     const commonRequestHeader = {
    //         requestId: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
    //         timestamp: formatDateTime(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    //         channel: 'AdminSelfcare',
    //         userId: null,
    //         tenantId: 1,
    //         msisdn: store.getState().auth.decodedToken?.msisdn,
    //         primaryMsisdn: store.getState().auth.decodedToken?.msisdn,
    //         deviceId: null,
    //         deviceModel: null,
    //         deviceType: null,
    //         username: store.getState().auth.decodedToken?.name
    //     };
    //
    //     request.headers['X-Request-Id'] = commonRequestHeader.requestId;
    //
    //     request.data = {
    //         ...request.data,
    //         requestHeader: commonRequestHeader,
    //     };
    // }

    if (request && request.data && request.url) {
        // const requestId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        const requestId = crypto.randomUUID();

        request.data = {
            ...request.data,
            request_id: requestId
        };
    }

    return request;
}

const isLoadingSpinnerExcludeUrl = (url: string) => {
    let isLoadingSpinnerExcludeUrl = false;
    loadingSpinnerExcludeUrls.forEach((singleExcludeUrl) => {
        if (url.includes(singleExcludeUrl)) {
            isLoadingSpinnerExcludeUrl = true;
        }
    });
    return isLoadingSpinnerExcludeUrl;
}


export default axiosInstance;
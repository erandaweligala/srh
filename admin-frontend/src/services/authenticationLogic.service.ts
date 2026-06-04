import INTERNAL_ROUTES from "../constants/internalRoutes";
import AccessTokenModel from "../model/accessToken.model.ts";
import showNotification from "./notification.service";
import { getErrorHumanReadableMessage } from "../helpers/backendErrorsHumanReadable";
import store, { authActions } from "../stores/mainStore";
import { getLoginUrl, logout } from "./authenticationApi.service";
import { LogoutBroadcastChannel } from "./browserBroadcast.service";
import { LocalStorageConstants } from "../constants/localStorage";
import { jwtDecode } from 'jwt-decode';

const initialApplicationLoading = (isCallingFromInitialAppLoad: boolean) => {

    if (
        isCallingFromInitialAppLoad && (
            window.location.pathname.includes('/internal') ||
            window.location.pathname.includes(INTERNAL_ROUTES.SESSION_EXPIRE_PAGE) ||
            window.location.pathname.includes(INTERNAL_ROUTES.UNAUTHORIZED_ACCESS_PAGE)
        )
    ) {
        store.dispatch(authActions.setAppInitialized());
        return;
    }

    const jwtAccessTokenFromLocalStorage: string | null = localStorage.getItem(LocalStorageConstants.ACCESS_TOKEN);
    let globalLastActiveTimeInEpoch;
    const nowTimeInEpoch = Math.floor(Date.now() / 1000); // Convert millisecond to seconds

    // eslint-disable-next-line prefer-const
    globalLastActiveTimeInEpoch = nowTimeInEpoch.toString();

    if (jwtAccessTokenFromLocalStorage && globalLastActiveTimeInEpoch) {

        try {
            const jwtAccessTokenDecoded: AccessTokenModel = jwtDecode(jwtAccessTokenFromLocalStorage) as AccessTokenModel;

            // Check Token Expiration
            if (nowTimeInEpoch < jwtAccessTokenDecoded.exp) {
                if (parseInt(globalLastActiveTimeInEpoch) + jwtAccessTokenDecoded.idleTimeRange > nowTimeInEpoch) {
                    mainLoginHandling(jwtAccessTokenFromLocalStorage);
                } else {
                    logoutAndRedirectToSessionExpirePage();
                }
            } else {
                localStorage.clear();
            }

        } catch (error: any) {
            localStorage.clear();
        }
    }

    store.dispatch(authActions.setAppInitialized());

}


const clickLoginButton = async () => {

    try {
        const loginUrl = await getLoginUrl();
        console.log("loginUrl", loginUrl);
        window.location.replace(loginUrl);
    } catch (error: any) {
        showNotification("ERROR", getErrorHumanReadableMessage(error));
    }

}


export const mainLoginHandling = (token: string) => {

    const nowTimeInEpoch = Math.floor(Date.now() / 1000); // Seconds

    const jwtDecoded: AccessTokenModel = jwtDecode(token) as AccessTokenModel;

    // Get Token Expired Time
    const tokenExpireTimeInSec = jwtDecoded.exp - nowTimeInEpoch;

    // Token Expired
    if (tokenExpireTimeInSec <= 0) {
        console.log('Token Is Expired');
        logoutAndRedirectToSessionExpirePage();
        throw new Error('Token Expired');
    }

    localStorage.setItem(LocalStorageConstants.ACCESS_TOKEN, token);
    localStorage.setItem(LocalStorageConstants.USER_DATA, token);
    store.dispatch(authActions.userLogin({ accessToken: token }));

}


const logoutAndRedirectToSessionExpirePage = () => {
    logout().finally(() => {
        localStorage.clear();
        sessionStorage.clear();
        store.dispatch(authActions.userLogout());
        LogoutBroadcastChannel.postMessage("LOGOUT");

        const azureLogoutUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/logout";
        const postLogoutRedirectUri = window.location.origin + INTERNAL_ROUTES.SESSION_EXPIRE_PAGE;

        document.location.href = `${azureLogoutUrl}?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    });
}

const logoutAndRedirectToLoginPage = () => {
    logout().finally(() => {
        localStorage.clear();
        sessionStorage.clear();
        store.dispatch(authActions.userLogout());
        LogoutBroadcastChannel.postMessage("LOGOUT");

        const azureLogoutUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/logout";
        const postLogoutRedirectUri = window.location.origin + INTERNAL_ROUTES.LOGIN_PAGE;

        document.location.href = `${azureLogoutUrl}?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    });
}

export const anotherTabAskToLogout = () => {
    document.location.href = INTERNAL_ROUTES.SESSION_EXPIRE_PAGE;
}


let idleTimeOutTimerId: any;
let idleTimeSetTimeInSeconds: number;

const setIdleLogoutTimer = (matchToGlobalTimer = false) => {

    if (store.getState().auth.isUserLogin) {

        console.log("Logout Timer Logic Started");

        let nextIdleTimerExecutionTimeInMilliSeconds: number;

        if (matchToGlobalTimer) {
            idleTimeSetTimeInSeconds = parseInt(localStorage.getItem(LocalStorageConstants.LAST_ACTIVE_TIME)!);
            nextIdleTimerExecutionTimeInMilliSeconds = (store.getState().auth.decodedToken!.idleTimeRange - (Math.floor(Date.now() / 1000) - idleTimeSetTimeInSeconds)) * 1000;
        } else {
            idleTimeSetTimeInSeconds = Math.floor(Date.now() / 1000); // Seconds
            localStorage.setItem(LocalStorageConstants.LAST_ACTIVE_TIME, idleTimeSetTimeInSeconds.toString());
            nextIdleTimerExecutionTimeInMilliSeconds = store.getState().auth.decodedToken!.idleTimeRange * 1000;
        }

        clearTimeout(idleTimeOutTimerId);

        idleTimeOutTimerId = setTimeout(() => {

            // @ts-ignore
            const globalActiveTime = parseInt(localStorage.getItem(LocalStorageConstants.LAST_ACTIVE_TIME));

            if (globalActiveTime === idleTimeSetTimeInSeconds) {
                logoutAndRedirectToSessionExpirePage();
            } else if (globalActiveTime > idleTimeSetTimeInSeconds) {
                setIdleLogoutTimer(true);
            }
        }, nextIdleTimerExecutionTimeInMilliSeconds);
    }

}

let lastInteractionTime = Date.now();

const trackUserInteraction = () => {
    const currentTime = Date.now();
    if (currentTime - lastInteractionTime > 3000) { // throttle by 3 seconds
        lastInteractionTime = currentTime;
        setIdleLogoutTimer(false);
    }
}

export {
    initialApplicationLoading,
    logoutAndRedirectToSessionExpirePage,
    logoutAndRedirectToLoginPage,
    clickLoginButton,
    setIdleLogoutTimer,
    trackUserInteraction
}

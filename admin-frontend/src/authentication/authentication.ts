import Keycloak from "keycloak-js";
const keycloakConfigs: string =  "";
let kcConfig = new Keycloak(keycloakConfigs);

const setKeyCloakConfig = () => {
    const hostname = window.location.hostname;

    switch (hostname) {
        case "selfcareadmin.mascom.bw":
        case "selfcareadmin-mic.mascom.bw":
        case "selfcareadmin-hq.mascom.bw":
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_PROD ?? ""));
            break;
        case "qa-selfcareadmin.mascom.bw":
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_QA ?? ""));
            break;
        case "dev-selfcareadmin.mascom.bw":
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_DEV ?? ""));
            break;
        case "stg-selfcareadmin.mascom.bw":
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_STG ?? ""));
            break;
        case "localhost":
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_DEV ?? ""));
            break;
        default:
            kcConfig = new Keycloak(JSON.parse(process.env.VITE_REACT_APP_KEYCLOAK_CONFIG_DEV ?? ""));
            break;
    }
}

const initializeKeycloak = (onAuthcallback: any) => {

    setKeyCloakConfig()

    kcConfig.init({
        onLoad: 'login-required',
        checkLoginIframe: false, // Set to false to avoid unnecessary iframe checks
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256', // Use PKCE for enhanced security
    }).then((authenticated) => {
        if (!authenticated) {
            console.log("user is not authenticated..!");
        }
        onAuthcallback();
    }).catch((error) => {
        console.error("Failed to initialize Keycloak", error);
    });
}

const getAccessToken = () => kcConfig.token;

const getUserRoles = () => kcConfig.resourceAccess;

const logoutUser = () => kcConfig.logout();

export const Authenticator = {
    initializeKeycloak,
    getAccessToken,
    logoutUser,
    getUserRoles,
}
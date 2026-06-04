import INTERNAL_ROUTES from "../constants/internalRoutes";
import {anotherTabAskToLogout} from "./authenticationLogic.service";

export enum BroadCastChannels {
    Logout= "LOGOUT"
}

export const LogoutBroadcastChannel = new BroadcastChannel(BroadCastChannels.Logout);

LogoutBroadcastChannel.onmessage = (event) => {
    // console.log("Message Received On LOGOUT Broadcast Channel");
    if(event.data === "LOGOUT" && !window.location.pathname.includes(INTERNAL_ROUTES.SESSION_EXPIRE_PAGE)) {
        // console.log("Need to execute logout function");
        anotherTabAskToLogout();
    }
}
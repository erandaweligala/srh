import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { clearTokenInterceptors, setTokenInterceptor } from "../services/axios.service";


import { jwtDecode } from 'jwt-decode';
import metadataSlice from "./metadataStore";
import AccessTokenModel from "../model/accessToken.model.ts";

interface AuthState {
    isUserLogin: boolean;
    isAppInitialized: boolean;
    accessToken: string | null;
    decodedToken: AccessTokenModel | null;
    roles: string[];
}

const initialAuthStatus: AuthState = {
    isUserLogin: false,
    isAppInitialized: false,
    accessToken: null,
    decodedToken: null,
    roles: [],
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthStatus,
    reducers: {
        userLogin(state, action: PayloadAction<{ accessToken: string, roles?: string[] }>) {
            state.isUserLogin = true;
            state.accessToken = action.payload.accessToken;
            const decoded = jwtDecode(action.payload.accessToken) as AccessTokenModel;
            state.decodedToken = decoded;
            state.roles = action.payload.roles ||
                (decoded.resource_access?.account?.roles) ||
                [];
            setTokenInterceptor();
        },
        userLogout(state) {
            state.isUserLogin = false;
            state.accessToken = null;
            state.decodedToken = null;
            state.roles = [];
            clearTokenInterceptors();
        },
        setAppInitialized(state) {
            state.isAppInitialized = true;
        },
    }
});

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        metadata: metadataSlice.reducer
    }
});

export const authActions = authSlice.actions;

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

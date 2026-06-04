import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ConfigModel, SettingsModel} from "../model/settings.model.ts";
import {DefaultConfigurations} from "../constants/validationConditions.ts";
import DropdownValue from "../model/dropdownValue.ts";
import {PermissionModel} from "../pages/user-management/models/permissions/permission.model.ts";

interface MetadataState {
    FAQCategories: DropdownValue[] | [];
    userStatusList: DropdownValue[] | [];
    userRolesList: {label: string; value: string; name: string;}[] | [];
    sourceList: DropdownValue[] | [];
    permissionsList: PermissionModel[] | [];
    systemSettings: ConfigModel[];
    loading: boolean;
}

const initialMetaDataState: MetadataState = {
    FAQCategories: [],
    userStatusList: [],
    userRolesList: [],
    sourceList: [],
    permissionsList: [],
    systemSettings: DefaultConfigurations,
    loading: true
}

const metadataSlice = createSlice({
    name: "metadata",
    initialState: initialMetaDataState,
    reducers: {
        setFQACategories(state, action: PayloadAction<DropdownValue[]>) {
            state.FAQCategories = action.payload
        },
        setUserStatusList(state, action: PayloadAction<DropdownValue[]>) {
            state.userStatusList = action.payload
        },
        setUserRolesList(state, action: PayloadAction<{label: string; value: string; name: string;}[]>) {
            state.userRolesList = action.payload
        },
        setSourceList(state, action: PayloadAction<DropdownValue[]>) {
            state.sourceList = action.payload
        },
        setPermissionList(state, action: PayloadAction<PermissionModel[]>) {
            state.permissionsList = action.payload
        },
        setSettings(state, action: PayloadAction<SettingsModel>) {
            state.systemSettings = action.payload.configList;
            state.loading = false;
        },
        useDefaultSettings(state) {
            state.systemSettings = initialMetaDataState.systemSettings;
            state.loading = false;
        },
        resetSettings(state) {
            state.systemSettings = initialMetaDataState.systemSettings;
            state.loading = true;
        }
    }
})

export const metadataAction = metadataSlice.actions;

export const selectLoading = (state: { metadata: { loading: boolean; }; }) => state.metadata.loading;

export default metadataSlice;
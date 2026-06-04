import {PermissionModelRoles} from "../permissions/permission.model.ts";

export interface RolesModel {
    roleId: string;
    id: string;
    name: string;
    description: string;
}

export interface MetaDataModel {
    label: string;
    value: string;
}

export interface RoleResponse {
    roleId: string;
    name: string;
    description: string;
    totalCount: string;
}

export interface RoleViewModel {
    roleId: string;
    roleName: string;
    description: string;
    permissions: PermissionModelRoles[];
}
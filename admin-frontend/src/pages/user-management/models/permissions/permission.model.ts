export interface PermissionListResponseModel {
    permissionId: string;
    name: string;
    description: string;
    componentName: string;
    menuName: string;
    totalCount: number;
}

export interface PermissionQueryParams {
    permissionName?: string;
    menuId?: number;
    componentId?: number;
    limit: number;
    offset: number;
}

export interface CheckedValuesObject {
    checkedActions: any[];
    checkedAttributes: any[];
}

export interface Attributes {
    attributeId: string;
    isSelected: boolean;
    attributeName: string;
}
export interface SubActions {
    isSelected: boolean;
    actionId: string;
    attributes: Attributes[];
    actionName: string;
}
export interface MainActions {
    isSelected: boolean;
    actionId: string;
    attributes: Attributes[];
    subActions: SubActions[]
    actionName: string;
}

export interface ComponentModel {
    componentId: string;
    componentName: string;
    description: string;
}

export interface MenuToComponentModel {
    menuId:string;
    menuName: string;
    components: ComponentModel[];
}

export interface PermissionByComponentIdAndMenuId {
    componentId?: string;
    menuId?: string;
}

export interface PermissionsEditModel {
    permissionId?:string,
    menuId: string,
    name: string,
    description: string,
    componentId: string,
    actions: string[],
    attributes: string[],
    createdBy?:string
}

export interface PermissionByComponentIdModel {
    mainActions: MainActions[];
}

export interface PermissionViewModel {
    permissionId: string;
    description: string;
    permissionName: string;
    menuId: string;
    menuName: string;
    componentId: string;
    componentName: string;
    mainActions: MainActions[];
}
export interface PermissionModel {
    permissionId: string;
    name: string;
    description: string;
    selected?: boolean;
}
export interface PermissionModelRoles {
    permissionId?: string;
    componentId: string;
    menuId: string;
    menuName: string;
    componentName: string;
    permissionDescription?: string;
    permissionName?: string;
    description?: string;
}
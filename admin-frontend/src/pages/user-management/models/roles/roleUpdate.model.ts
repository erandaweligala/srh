export interface RoleUpdateModel {
    roleId: string;
    roleName: string;
    description: string;
    permissionIdList: number[],
    createdBy?:string;
}
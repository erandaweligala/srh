export interface RoleCreateModel {
    roleName: string;
    description: string;
    createdBy?:string;
    permissionIdList: number[]
}
export interface UsersSearchRequestModel {
    userId?: string | null;
    userName?: string | null;
    emailAddress?: string | null;
    roleId?: string | null;
    statusId?: string | null;
    limit: number;
    offset: number;
}
export interface UsersModel {
    id: string;
    userId: string;
    name: string;
    mobileNumber?: string;
    lastLogin: string;
    firstName: string;
    lastName: string;
    roleName: string;
    roleDescription: string;
    roleId: string;
    status: string;
    contactNo: string;
    email: string;
    operator: string;
    userName: string;
    userRole: string;
}

export interface UserResponseModel {
    userList: UsersModel[];
}
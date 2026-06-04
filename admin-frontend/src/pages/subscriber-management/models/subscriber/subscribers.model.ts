export interface SubscribersModel {
    userId: string;
    userName: string;
    groupId: string;
    status: string;
    contactName: string;
    contactEmail: string;
    contactNumber: string[];
    billingAccountRef: string[];
    billing: string;
    concurrency: string;
    subscription: string;
    createdDate: string;
    lastUpdatedDate: string;
    cycleDate: string;
    time: number;
    sessionTimeout: string;
    idleTimeout: string;
    customTimeout: string;
    nasPortType: string;
    vlanId: string;
    circuitId: string;
    remoteId: string;
    macAddress: string[];
    ipAllocation: string;
    ipPoolName: string;
    ipv4: string;
    ipv6: string;
}

export interface SubscriberResponseModel {
    page: number;
    pageSize: number;
    totalRecords: number;
    users: SubscribersModel[];
}

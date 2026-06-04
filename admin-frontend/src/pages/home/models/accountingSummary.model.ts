export interface AccountingSummaryModel {
    coaRequestCount: number;
    authenticationSuccessCount: number;
    coaFailureCount: number;
    authenticationFailureCount: number;
    activeSubscriberCount: number;
    inactiveSubscriberCount: number;
}

export interface UserStatusSummaryModel {
    active: number;
    barred: number;
    inactive: number;
}
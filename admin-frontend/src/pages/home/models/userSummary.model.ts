export interface UserSummaryModel {
    connectionTypes: {
        total: number;
        prepaid: number;
        postpaid: number;
    };
    todayNewUsers: number;
    todayActiveUsers: number;
}

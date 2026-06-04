export interface RecentActivitiesModel {
    activityId: number;
    activity: string;
    userName: string;
    status: string;
    details: string;
    createdDate: string;
}

export interface RecentActivitiesResponseModel {
    recentActivityDetailsList: RecentActivitiesModel[];
    pagination: {
        totalCount: number;
        pageNo: number;
    };
}
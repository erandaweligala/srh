export interface OnboardingListModel {
    id: number;
    day: string;
    date: string;
    count: number;
}

export interface OnboardingListResponse {
    userOnbordingDetailsList: OnboardingListModel[];
    pagination: {
        totalCount: number;
        pageNo: number;
    };
}
export interface PageDetails {
    totalRecords: string;
    pageNumber: string;
    pageElementCount: string;
}

interface BaseResponse<T> {
    status?: string;
    success?: boolean;
    message: string;
    data: T;
    pageDetails?: PageDetails;
}

export default BaseResponse;
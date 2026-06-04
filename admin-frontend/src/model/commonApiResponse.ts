interface CommonApiResponse<T> {
    responseHeader: {
        requestId: string,
        timestamp: string,
        code: string,
        desc: string
     };
     responseBody: T
}

export default CommonApiResponse;

export interface CommonApiResponseUMS<T> {
    responseData:T,
    result: {
        resultCode: string;
        resultDescription: string;
        pageDetail: PageDetail
    }
}

export interface PageDetail {
    pageNumber: number;
    pageElementCount: number;
    totalRecords: number;
}
interface ApiCommonResponse<T> {
    success?: boolean;
    status?: string;
    message?: string;
    data: T;
}

export default ApiCommonResponse;
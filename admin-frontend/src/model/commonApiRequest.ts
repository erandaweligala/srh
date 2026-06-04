interface CommonApiRequest<T> {
    requestBody: T;
    requestHeader: {
        requestId: string;
        timestamp: string;
        channel: string;
        userId: number | null;
        tenantId: number;
        msisdn: string;
        primaryMsisdn: string;
        deviceId: string | null;
        deviceModel: string | null;
        deviceType: string | null;
        username: string | null;
    } | null
}

export default CommonApiRequest;
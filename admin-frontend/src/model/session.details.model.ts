export interface SessionDetailsModel {
    dateTime: String;
    messageId: string;
    messageType: string;
    serviceId: string;
    usage: number;
    sessionId: string;
    bucketId: string;
}

export type SessionDetailsResponseModel = SessionDetailsModel[];
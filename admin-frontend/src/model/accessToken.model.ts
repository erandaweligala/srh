export default interface AccessTokenModel {
    iat: number;
    exp: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    sid: string;
    acr: string;
    realm_access: {
        roles: string[];
    };
    resource_access: {
        account: {
            roles: string[];
        }
    };
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    msisdn: string;
    family_name: string;
    email: string;
    idleTimeRange: number;

    permissions: {
        menuids: number[];
        components: {
            id: number,
            actions: number[];
            attributes: number[];
        }[]
    },
}
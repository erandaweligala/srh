package com.adl.et.telco.dte.adminauthmgt.util.resultenum;

public enum AuthCodeEnum {




    INTERNAL_SERVER_ERROR("101", "Internal Server Error."),

    AUTH_REQUEST_SUCCESS("6000","Success." ),
    LOGIN_INTERNAL_SERVER_ERROR("6001","LOGIN_INTERNAL_SERVER_ERROR" ),
    LOGOUT_INTERNAL_SERVER_ERROR("6002","LOGOUT INTERNAL SERVER ERROR" ),
    LOGIN_SUCCESS("6666","Login Success"),
    TEMP_TOKEN_MUST_NOT_BE_NULL("6003","TEMP TOKEN MUST NOT BE NULL"),
    TEMP_TOKEN_EXPIRED("6004", "Temp Token Expired."),
    INVALID_TEMP_TOKEN("6005","Invalid Temp Token" ),
    RV_TOKEN_MUST_NOT_BE_NULL("6006", "RV TOKEN MUST NOT BE NULL"),
    INVALID_RV_TOKEN("6007", "Invalid RV Token" ),
    CREATE_ACCESS_TOKEN_FAILED("6008", "Create Access Token Failed"),
    INVALID_USER_STATUS("6008", "Invalid user status! Please re-try with active user"),
    INVALID_TOKEN("6009", "UNAUTHORIZED TOKEN"),
    NOT_IN_REFRESH_TIME("6010", "Not In Refresh Time"),
    ACCESS_TOKEN_EXPIRED("6011", "Access Token Expired"),
    ACCESS_FORBIDDEN("6012", "Access_Forbidden"),
    INVALID_SAML_DOCUMENT("6013","invalid saml doc"),

    INACTIVE_USER("6014","INACTIVE_USER"),

    INVALID_SAML_RESPONSE("6015","INVALID_SAML_RESPONSE"),

    INVALID_SAML_OBJECT("6016","INVALID_SAML_OBJECT"),

    USER_NOT_FOUND("6017","user not found"),

    USER_NOT_IN_CACHE("6018","User Not In Cache"),
    EXCEPTION_SERVICE_LAYER("6099", "Exception in Authentication"),
    USER_NOT_HAVE_ACCESS_TO_SYSTEM("6101", "User not have access to system."),
    USER_ALREADY_LOGGED_IN("6102", "User is already logged in from another device or browser."),
    XSS_DETECTED("6103", "Potential XSS content detected in the request.");
    private String code;
    private String description;

    AuthCodeEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String code(){
        return code;
    }
    public String description(){
        return description;
    }
}


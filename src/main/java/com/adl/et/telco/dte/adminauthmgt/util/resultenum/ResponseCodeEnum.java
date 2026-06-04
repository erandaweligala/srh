package com.adl.et.telco.dte.adminauthmgt.util.resultenum;

public enum ResponseCodeEnum {
    SUCCESSFUL("00", "SUCCESSFUL"),

    EXCEPTION_ADAPTER_INTEGRATION_LAYER("97", "EXCEPTION IN ADAPTER INTEGRATION LAYER"),
    EXCEPTION_SERVICE_LAYER("96", "EXCEPTION IN SERVICE LAYER"),
    INTERNAL_SERVER_ERROR("99", "INTERNAL SERVER ERROR"),
    EXCEPTION_ADVISER_CONTROLLER("95", "EXCEPTION IN LOGGING ADVISER - CONTROLLER"),
    EXCEPTION_ADVISER_SERVICE_LAYER("94", "EXCEPTION IN LOGGING ADVISER - SERVICE LAYER"),
    EXCEPTION_ADVISER_ADAPTER_INTEGRATION_LAYER("93", "EXCEPTION IN LOGGING ADVISER - ADAPTER INTEGRATION"),
    ERROR_RESPONSE_BSS_APIS("11", "ERROR RESPONSE FROM BSS API"),
    INVALID_TOKEN("21", "UNAUTHORIZED TOKEN"),
    INVALID_INPUT_SERVICE_LAYER("70", "INVALID INPUT - EXCEPTION IN SERVICE LAYER"),
    TOKEN_EXPIRED("28", "Your session has been expired!"),
    EMPTY_RESPONSE("133","EMPTY RESPONSE"),
    BAD_REQUEST("400", "BAD REQUEST");

    private String code;
    private String description;

    ResponseCodeEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String code() {
        return code;
    }

    public String description() {
        return description;
    }
}

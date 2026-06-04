package com.adl.et.telco.dte.adminauthmgt.util.resultenum;

/**
 * Centralised catalogue of result codes/messages that are surfaced to
 * north-bound consumers. Keeping everything in one enum ensures we never end up
 * with hard-coded strings scattered across the service layer.
 */
public enum DisplayResultCodeEnum {

    INVALID_INPUT("SRH-0001", "Invalid request payload"),
    ACCESS_DENIED("SRH-0002", "Access denied"),
    INTERNAL_SERVER_ERROR("SRH-0003", "Internal server error"),

    GET_PERMISSION_LIST_FAILED("SRH-1001", "Failed to fetch permission list"),
    GET_PERMISSION_DETAILS_FAILED("SRH-1002", "Failed to fetch permission details"),
    GET_PERMISSION_META_DATA_FAILED("SRH-1003", "Failed to fetch permission meta data"),
    GET_ALL_MENU_COMPONENT_FAILED("SRH-1004", "Failed to fetch menu and components"),
    GET_ACTION_TO_COMPONENT_FAILED("SRH-1005", "Failed to fetch component hierarchy"),
    CREATE_PERMISSION_FAILED("SRH-1006", "Failed to create permission"),
    EDIT_PERMISSION_FAILED("SRH-1007", "Failed to edit permission"),
    GET_FILTERED_PERMISSION_LIST_FAILED("SRH-1008", "Failed to fetch filtered permission list"),

    GET_ROLE_LIST_FAILED("SRH-1101", "Failed to fetch role list"),
    GET_ROLE_DETAILS_FAILED("SRH-1102", "Failed to fetch role details"),
    GET_ROLE_META_DATA_FAILED("SRH-1103", "Failed to fetch role meta data"),
    GET_FILTERED_ROLE_LIST_FAILED("SRH-1104", "Failed to fetch filtered role list"),
    CREATE_ROLE_FAILED("SRH-1105", "Failed to create role"),
    UPDATE_ROLE_FAILED("SRH-1106", "Failed to update role"),

    GET_USER_DETAILS_FAILED("SRH-1201", "Failed to fetch user details"),
    CREATE_USER_FAILED("SRH-1202", "Failed to create user"),
    EDIT_USER_FAILED("SRH-1203", "Failed to edit user"),
    GET_ALL_USER_FAILED("SRH-1204", "Failed to fetch user list"),
    GET_USER_STATUS_META_DATA_FAILED("SRH-1205", "Failed to fetch user status meta data"),
    VALIDATE_EMAIL_FAILED("SRH-1206", "Failed to validate email"),
    GET_USER_BASIC_INFO_FAILED("SRH-1207", "Failed to fetch user basic info"),
    GET_USERNAME_FAILED("SRH-1208", "Failed to fetch username"),

    GET_USER_ACTIVITY_LOG_FAILED("SRH-1301", "Failed to fetch user activity logs"),
    CREATE_USER_ACTIVITY_LOG_FAILED("SRH-1302", "Failed to create user activity log"),
    UPDATE_USER_ACTIVITY_LOG_FAILED("SRH-1303", "Failed to update user activity log"),
    GET_ACTIVITY_FAILED("SRH-1304", "Failed to fetch activities"),
    GET_ACTIVITY_LIST_FAILED("SRH-1305", "Failed to fetch activity list"),
    GET_ACTIVITY_LIST_SUCCESS("SRH-1306", "Successfully fetched activity list");

    private final String code;
    private final String description;

    DisplayResultCodeEnum(String code, String description) {
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



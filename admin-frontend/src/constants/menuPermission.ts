const MENU_PERMISSION = {
    //main menu
    DASHBOARD: {menuId:1},
    BNG_MANAGEMENT: {menuId: 3},
    SUBSCRIBER_MANAGEMENT: {menuId: 2},
    USER_MANAGEMENT: {menuId: 5},
    SESSION_DETAILS: {menuId: 4},
    PRODUCT_CATALOG: {menuId: 6},
    MASTER_DATA: {menuId: 7},
    LOGS: {menuId: 8},
    REPORTS: {menuId: 9},
    CONFIGURATION_MANAGEMENT: {menuId: 22},


    //sub menuId
    SUBSCRIBER_MANAGEMENT_INDIVIDUAL: {menuId: 10},
    BNG: {menuId: 11},
    SESSION_HISTORY: {menuId: 12},
    USER: {menuId: 13},
    ROLE: {menuId: 14},
    PERMISSION: {menuId: 15},
    SEARCH_PLAN_MENU: {menuId: 16},
    QOS_MANAGEMENT: {menuId: 17},
    BUCKET_MANAGEMENT: {menuId: 18},
    MESSAGE_LOGS: {menuId: 19},
    ERROR_LOGS: {menuId: 20},
    NOTIFICATION_TEMPLATE: {menuId:21},
    VENDOR_SPECIFIC_CONFIGURATION: {menuId: 23},
    PENDING_APPROVALS: {menuId:24},
    SUBSCRIBER_MANAGEMENT_GROUP: {menuId: 25}, //Newly added
    AUDIT_LOGS: {menuId: 26}, //Newly added


}

export default MENU_PERMISSION;
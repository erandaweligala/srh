const ACTION_PERMISSION = {
    // BNG HOME Page
    BNG_HOME_PAGE: {actionId: 1, isMainAction: true, mainActionId: null, componentId: 31},
    SUBSCRIBER_SUMMARY: {actionId: 128, isMainAction: true, mainActionId: null, componentId: 31},
    CHECK_HOME_PAGE: {actionId: 3, isMainAction: false, mainActionId: 1, componentId: 31},
    VIEW_SUMMARY: {actionId: 102, isMainAction: true, mainActionId: null, componentId: 31},


   // Subscriber Management - Individual
    SEARCH_SUBSCRIBER_INDIVIDUAL: { actionId: 4, isMainAction: true, mainActionId: null, componentId: 1 },
    CREATE_NEW_SUBSCRIBER_ACTION_INDIVIDUAL: { actionId: 6, isMainAction: true, mainActionId: null, componentId: 1 },
    EXPORT_SUBSCRIBER_INDIVIDUAL: { actionId: 5, isMainAction: true, mainActionId: null, componentId: 1 },
    UPDATE_SUBSCRIBER_ACTION_INDIVIDUAL: { actionId: 7, isMainAction: true, mainActionId: null, componentId: 1 },
    DELETE_SUBSCRIBER_ACTION_INDIVIDUAL: { actionId: 8, isMainAction: true, mainActionId: null, componentId: 1 },

    VIEW_SUBSCRIBER_ACTION_INDIVIDUAL: { actionId: 110, isMainAction: true, mainActionId: null, componentId: 1 },
    EDIT_PASSWORD_SUBSCRIBER_ACTION_INDIVIDUAL: { actionId: 111, isMainAction: true, mainActionId: null, componentId: 1 },


    // Action_Info
    SEARCH_ACTION: { actionId: 81, isMainAction: true, mainActionId: null, componentId: 1 },


    // Service_Info
    SEARCH_SERVICE_ACTION: { actionId: 83, isMainAction: true, mainActionId: null, componentId: 1 },
    ADD_SERVICE_ACTION: { actionId: 84, isMainAction: true, mainActionId: null, componentId: 1 },
    UPDATE_SERVICE_ACTION: { actionId: 85, isMainAction: true, mainActionId: null, componentId: 1 },
    DELETE_SERVICE_ACTION: { actionId: 86, isMainAction: true, mainActionId: null, componentId: 1 },
    VIEW_BUCKET_ACTION: { actionId: 87, isMainAction: true, mainActionId: null, componentId: 1 },


    // Connection_History
    SEARCH_CONNECTION_HISTORY: { actionId: 88, isMainAction: true, mainActionId: null, componentId: 1 },
    VIEW_CONNECTION_ACTION: { actionId: 89, isMainAction: true, mainActionId: null, componentId: 1 },
    TERMINATE_SESSION: { actionId: 100, isMainAction: true, mainActionId: null, componentId: 1 },


    // BNG Management
    SEARCH_BNG: { actionId: 12, isMainAction: true, mainActionId: null, componentId: 7 },
    ADD_NEW_BNG_ACTION: { actionId: 14, isMainAction: true, mainActionId: null, componentId: 7 },
    UPDATE_BNG_ACTION: { actionId: 16, isMainAction: true, mainActionId: null, componentId: 7 },
    VIEW_BNG_ACTION: { actionId: 17, isMainAction: true, mainActionId: null, componentId: 7 },


    // Session Details
    SEARCH_SESSION_ACTION: { actionId: 19, isMainAction: true, mainActionId: null, componentId: 8 },
    EXPORT_SESSION_REPORT_ACTION: { actionId: 20, isMainAction: true, mainActionId: null, componentId: 8 },
    TERMINATE_SESSION_ACTION: { actionId: 21, isMainAction: true, mainActionId: null, componentId: 8 },
    VIEW_SESSION: { actionId: 64, isMainAction: true, mainActionId: null, componentId: 8 },


    // UMS - USER
    SEARCH_USERS_ACTION: { actionId: 22, isMainAction: true, mainActionId: null, componentId: 10 },
    ADD_NEW_USER_ACTION: { actionId: 42, isMainAction: true, mainActionId: null, componentId: 10 },
    VIEW_USER_DETAILS_ACTION: { actionId: 43, isMainAction: true, mainActionId: null, componentId: 10 },
    UPDATE_USER_ACTION: { actionId: 45, isMainAction: true, mainActionId: null, componentId: 10 },


    // UMS - ROLES
    SEARCH_ROLES_LIST: { actionId: 24, isMainAction: true, mainActionId: null, componentId: 12 },
    CREATE_NEW_ROLE_ACTION: { actionId: 38, isMainAction: true, mainActionId: null, componentId: 12 },
    UPDATE_ROLE_ACTION: { actionId: 40, isMainAction: true, mainActionId: null, componentId: 12 },
    VIEW_ROLE_ACTION: { actionId: 41, isMainAction: true, mainActionId: null, componentId: 12 },


    // UMS - PERMISSION
    PERMISSION_LIST: { actionId: 26, isMainAction: true, mainActionId: null, componentId: 14 },
    CREATE_NEW_PERMISSION: { actionId: 28, isMainAction: true, mainActionId: null, componentId: 14 },
    UPDATE_PERMISSION: { actionId: 32, isMainAction: true, mainActionId: null, componentId: 14 },
    VIEW_PERMISSION_DETAILS: { actionId: 30, isMainAction: true, mainActionId: null, componentId: 14 },


    // NOTIFICATION_TEMPLATE
    SEARCH_NOTIFICATION_TEMPLATE: { actionId: 71, isMainAction: true, mainActionId: null, componentId: 26 },
    ADD_NOTIFICATION_TEMPLATE: { actionId: 73, isMainAction: true, mainActionId: null, componentId: 26 },
    UPDATE_NOTIFICATION_TEMPLATE: { actionId: 75, isMainAction: true, mainActionId: null, componentId: 26 },
    VIEW_NOTIFICATION_TEMPLATE: { actionId: 76, isMainAction: true, mainActionId: null, componentId: 26 },


    //VENDOR SPECIFIC CONFIGURATION
    SEARCH_VENDOR_CONFIG: { actionId: 105, isMainAction: true, mainActionId: null, componentId: 28 },
    ADD_VENDOR_CONFIG: { actionId: 106, isMainAction: true, mainActionId: null, componentId: 28 },
    UPDATE_VENDOR_CONFIG: { actionId: 107, isMainAction: true, mainActionId: null, componentId: 28 },
    DELETE_VENDOR_CONFIG: { actionId: 109, isMainAction: true, mainActionId: null, componentId: 28 },


    // QOS Management
    ADD_QOS_MANAGEMENT : { actionId: 54, isMainAction: true, mainActionId: null, componentId: 17 },
    UPDATE_QOS_MANAGEMENT : { actionId: 56, isMainAction: true, mainActionId: null, componentId: 17 },
    DELETE_QOS_MANAGEMENT : { actionId: 57, isMainAction: true, mainActionId: null, componentId: 17 },
    SEARCH_QOS_MANAGEMENT : { actionId: 118, isMainAction: true, mainActionId: null, componentId: 17 },


    // Pending Approvals
    PENDING_APPROVALS_COMPONENT: { actionId: 94, isMainAction: true, mainActionId: null, componentId: 30 },


    // Bucket management
    ADD_NEW_BUCKET: { actionId: 59, isMainAction: true, mainActionId: null, componentId: 18 },
    SEARCH_BUCKET: { actionId: 60, isMainAction: true, mainActionId: null, componentId: 18 },
    UPDATE_BUCKET: { actionId: 62, isMainAction: true, mainActionId: null, componentId: 18 },
    DELETE_BUCKET: { actionId: 63, isMainAction: true, mainActionId: null, componentId: 18 },


    // Message logs
    SEARCH_MESSAGE_LOGS: { actionId: 66, isMainAction: true, mainActionId: null, componentId: 19 },
    EXPORT_MESSAGE_LOG_REPORT: { actionId: 67, isMainAction: true, mainActionId: null, componentId: 19 },

   
    // Error logs
    SEARCH_ERROR_LOGS: { actionId: 69, isMainAction: true, mainActionId: null, componentId: 22 },


    // Audit Logs
    SEARCH_AUDIT_LOGS: {actionId: 98, isMainAction: true, mainActionId: null, componentId: 33},
    EXPORT_AUDIT_LOGS: {actionId: 99, isMainAction: true, mainActionId: null, componentId: 33},


    // Product catalog
    SEARCH_PLANS: { actionId: 36, isMainAction: true, mainActionId: null, componentId: 16 },
    EXPORT_PLAN_DETAILS_REPORT: { actionId: 37, isMainAction: true, mainActionId: null, componentId: 16 },
    CREATE_PLAN: { actionId: 49, isMainAction: true, mainActionId: null, componentId: 16 },
    VIEW_PLAN: { actionId: 50, isMainAction: true, mainActionId: null, componentId: 16 },
    UPDATE_PLAN: { actionId: 52, isMainAction: true, mainActionId: null, componentId: 16 },

    REQUEST_PLAN_APPROVAL: { actionId: 93, isMainAction: true, mainActionId: null, componentId: 16 },
    DELETE_PRODUCT_CATALOG: { actionId: 78, isMainAction: true, mainActionId: null, componentId: 16 },
    VIEW_BUCKET_INFO_PRODUCT_CATALOG: { actionId: 79, isMainAction: false, mainActionId: 50, componentId: 16 },
    VIEW_QOS_PROFILE_INFO: { actionId: 80, isMainAction: false, mainActionId: 79, componentId: 16 },
    APPROVE_PLAN: { actionId: 91, isMainAction: true, mainActionId: null, componentId: 16 },
    REJECT_PLAN: { actionId: 92, isMainAction: true, mainActionId: null, componentId: 16 },
    APPROVAL_HISTORY: { actionId: 96, isMainAction: true, mainActionId: null, componentId: 16 },
   // SUBMIT_REQUEST_APPROVAL: { actionId: 90, isMainAction: true, mainActionId: null, componentId: 16 },


    // Subscriber Management - Group
    SEARCH_SUBSCRIBER_GROUP: { actionId: 112, isMainAction: true, mainActionId: null, componentId: 32 },
    VIEW_SERVICE_INFO_SUBSCRIBER_GROUP: { actionId: 113, isMainAction: true, mainActionId: null, componentId: 32 },
    CREATE_NEW_SUBSCRIBER_ACTION_GROUP: { actionId: 114, isMainAction: true, mainActionId: null, componentId: 32 },
    UPDATE_SUBSCRIBER_ACTION_GROUP: { actionId: 116, isMainAction: true, mainActionId: null, componentId: 32 },
    DELETE_SUBSCRIBER_ACTION_GROUP: { actionId: 117, isMainAction: true, mainActionId: null, componentId: 32 },
    VIEW_SUBSCRIBER_ACTION_GROUP: { actionId: 115, isMainAction: true, mainActionId: null, componentId: 32 },


    // Reports
    DOWNLOAD_REPORT: { actionId: 70, isMainAction: true, mainActionId: null, componentId: 21 },
    REPORTS_LIST_COMPONENT: { actionId: 101, isMainAction: true, mainActionId: null, componentId: 21 },

   
  

}


export default ACTION_PERMISSION;






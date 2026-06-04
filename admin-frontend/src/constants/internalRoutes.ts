const INTERNAL_ROUTES = {
    LOGIN_PAGE: "/airtel-aaa-admin-frontend/login",
    GET_TEMP_TOKEN_PAGE_SUCCESS: '/airtel-aaa-admin-frontend/internal/success/:tempToken',
    GET_TEMP_TOKEN_PAGE_ERROR: '/airtel-aaa-admin-frontend/internal/error/:errorType',

    HOME_PAGE: "/airtel-aaa-admin-frontend/home",
    SESSION_EXPIRE_PAGE: "/airtel-aaa-admin-frontend/session-expire",
    UNAUTHORIZED_ACCESS_PAGE: "/airtel-aaa-admin-frontend/unauthorized-access",

    SUBSCRIBERS: "/airtel-aaa-admin-frontend/subscribers",
    SUBSCRIBERS_GROUP: "/airtel-aaa-admin-frontend/subscribers-group",

    SESSION_HISTORY: "/airtel-aaa-admin-frontend/session-history",
    NAS_BNG: "/airtel-aaa-admin-frontend/nas-bng",

    USERS: "/airtel-aaa-admin-frontend/users",
    ROLES: "/airtel-aaa-admin-frontend/roles",
    PERMISSIONS: "/airtel-aaa-admin-frontend/permissions",

    PRODUCT_CATALOG: "/airtel-aaa-admin-frontend/product-catalog",
    QOS_MANAGEMENT: "/airtel-aaa-admin-frontend/qos-management",
    BUCKET_MANAGEMENT: "/airtel-aaa-admin-frontend/bucket-management",
    PENDING_APPROVALS: "/airtel-aaa-admin-frontend/pending-approvals",

    MESSAGE_LOGS: "/airtel-aaa-admin-frontend/message-logs",
    AUDIT_LOGS: "/airtel-aaa-admin-frontend/audit-logs",
    BULK_TRANSACTIONS: "/airtel-aaa-admin-frontend/bulk-transactions",
    ERROR_LOGS: "/airtel-aaa-admin-frontend/error-logs",

    REPORTS_PAGE: "/airtel-aaa-admin-frontend/reports",

    BLOCK_USER: "/airtel-aaa-admin-frontend/block-user",
    UNBLOCK_USER: "/airtel-aaa-admin-frontend/unblock-user",
    TERMS_AND_CONDITIONS: "/airtel-aaa-admin-frontend/terms-and-conditions",
    FAQS: "/airtel-aaa-admin-frontend/faqs",
    OTP_CONFIGURATIONS: "/airtel-aaa-admin-frontend/otp-configurations",
    FAQ_CATEGORIES: "/airtel-aaa-admin-frontend/faq-categories",
    BLOCK_UNBLOCK_USERS: "/airtel-aaa-admin-frontend/user-management",

    USER_APPROVALS: "/airtel-aaa-admin-frontend/enterprise-settings",
    CONFIGURATION_MANAGEMENT: "/airtel-aaa-admin-frontend/configuration-management",
    VENDOR_SPECIFIC_CONFIGURATION: "/airtel-aaa-admin-frontend/vendor-specific-configuration",
    NOTIFICATION_CONFIGURATION: "/airtel-aaa-admin-frontend/notification-configuration",
}

export default INTERNAL_ROUTES;
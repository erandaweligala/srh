package com.adl.et.telco.dte.adminauthmgt.dto.common;

public class RequestContextDetail {
    private static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> SOURCE_SYSTEM_ID = new ThreadLocal<>();
    public static String getRequestID() {
        return REQUEST_ID.get();
    }
    public static String getSourceSystemID() {
        return SOURCE_SYSTEM_ID.get();
    }
    public static void setRequestID(String tenantId) {
        REQUEST_ID.set(tenantId);
    }
    public static void setSourceSystemID(String tenantId) {
        SOURCE_SYSTEM_ID.set(tenantId);
    }

    public static void removeRequestId() {
        REQUEST_ID.remove();
    }
    public static void removeSourceSystemID() {
        SOURCE_SYSTEM_ID.remove();
    }
}

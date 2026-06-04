package com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.ActionLogData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.SingleActionLogResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLog;

import java.util.List;

public interface UserActivityLogInterface {
    void logUserActivity(String activity, String activityId, String detailedRequest, String url, String user, Integer actionId, String type);
    void updateStatus(String activityId, String status, String statusDescription);
    CommonNorthBoundResponse<List<ActionLog>> getActionLog(TableFilterRequest tableFilterRequest);
    CommonNorthBoundResponse<ActionLog> getActionLogById(String id);
}

package com.adl.et.telco.dte.adminauthmgt.controller.ums;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.ActionLogData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity.SingleActionLogResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLog;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/srh/user-management/user-action-log")
@RequiredArgsConstructor
public class UserActionLogManagementController extends BaseController {

    private final UserActivityLogInterface userActionLogManagementInterface;

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("/get-log")
    public ResponseEntity<CommonNorthBoundResponse<List<ActionLog>>> getActionLog(@RequestBody TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userActionLogManagementInterface.getActionLog(tableFilterRequest));
    }

//    @GetMapping("/get-activity-list")
//    public ResponseEntity<CommonNorthBoundResponse<List<String>>> getActivityList(HttpServletRequest httpServletRequest) throws BaseException {
//        return setResponseEntity(userActionLogManagementInterface.getActivityList());
//    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/{id}")
    public ResponseEntity<CommonNorthBoundResponse<ActionLog>> getActionLogById(@PathVariable String id, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userActionLogManagementInterface.getActionLogById(id));
    }
}

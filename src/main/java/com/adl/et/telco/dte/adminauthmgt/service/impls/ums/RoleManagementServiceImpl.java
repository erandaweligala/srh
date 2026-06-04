package com.adl.et.telco.dte.adminauthmgt.service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.client.ums.RoleManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.CreateNewRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleDetails;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleView;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.UpdateRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.RoleManagementInterface;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.ActionLogMsgCreator;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleManagementServiceImpl implements RoleManagementInterface {

    private final RoleManagementClient roleManagementClient;
    private final ResponseHandler handler;
    private final UserActivityLogInterface userActivityLogInterface;
    private final JwtService jwtService;
    private final ActionLogMsgCreator actionLogMsgCreator;

    @Override
    public CommonNorthBoundResponse<List<RoleView>> getRoleList(int limit, int offset, String roleName,
            HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("View user Roles List", MDC.get(AdminAuthConstant.TRACE_ID),
                    "Role name: " + roleName, httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"View");
            CommonSouthBoundResponse<List<RoleView>> roleView = roleManagementClient.getRoleList(limit, offset,
                    roleName);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilderWithPageInformation(roleView.getResponseData(),
                    roleView.getResult().getResultDescription(),
                    roleView.getResult().getResultCode(), roleView.getResult().getPageDetail());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<RoleDetails> getRoleDetails(String roleId, HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("Retrieve User Role By Id", MDC.get(AdminAuthConstant.TRACE_ID),
                    "Role id: " + roleId, httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"View");
            CommonSouthBoundResponse<RoleDetails> roleView = roleManagementClient.getRoleDetails(roleId);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(roleView.getResponseData(), roleView.getResult().getResultDescription(),
                    roleView.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_ROLE_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_DETAILS_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_ROLE_DETAILS_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<String> createRole(CreateNewRole createNewRoleRequest,
            HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("Create new User Role", MDC.get(AdminAuthConstant.TRACE_ID),
                    createNewRoleRequest.toString(), httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Add");
            CommonSouthBoundResponse<String> roleView = roleManagementClient.createRole(createNewRoleRequest);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(null, roleView.getResult().getResultDescription(),
                    roleView.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.CREATE_ROLE_FAILED.description(),
                    DisplayResultCodeEnum.CREATE_ROLE_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.CREATE_ROLE_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<String> updateRole(UpdateRole updateRoleRequest,
            HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("Update User Role", MDC.get(AdminAuthConstant.TRACE_ID),
                    updateRoleRequest.toString(), httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Update");
            CommonSouthBoundResponse<String> roleView = roleManagementClient.updateRole(updateRoleRequest);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(null, roleView.getResult().getResultDescription(),
                    roleView.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.UPDATE_ROLE_FAILED.description(),
                    DisplayResultCodeEnum.UPDATE_ROLE_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.UPDATE_ROLE_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<List<MetaData>> getRoleMetaData() {
        CommonSouthBoundResponse<List<MetaData>> roleView = roleManagementClient.getRoleMetaData();
        return handler.responseBuilder(roleView.getResponseData(), roleView.getResult().getResultDescription(),
                roleView.getResult().getResultCode());
    }

    @Override
    public CommonNorthBoundResponse<List<RoleView>> getFilteredRoleList(TableFilterRequest tableFilterRequest,
            HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("View user Roles List", MDC.get(AdminAuthConstant.TRACE_ID),
                    actionLogMsgCreator.createMsgForFilterUserList(tableFilterRequest.getFilterValues()),
                    httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"View");
            CommonSouthBoundResponse<List<RoleView>> roleView = roleManagementClient
                    .getFilteredRoleList(tableFilterRequest);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilderWithPageInformation(roleView.getResponseData(),
                    roleView.getResult().getResultDescription(),
                    roleView.getResult().getResultCode(), roleView.getResult().getPageDetail());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.code(), ex.getStackTrace());
        }
    }
}

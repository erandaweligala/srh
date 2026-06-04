package com.adl.et.telco.dte.adminauthmgt.service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.client.ums.PermissionManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents.MenuComponents;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.PermissionManagementInterface;
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
public class PermissionManagemenServiceImpl implements PermissionManagementInterface {

    private final PermissionManagementClient permissionManagementClient;
    private final ResponseHandler handler;
    private final UserActivityLogInterface userActivityLogInterface;
    private final JwtService jwtService;
    private final ActionLogMsgCreator actionLogMsgCreator;

    @Override
    public CommonNorthBoundResponse<List<PermissionView>> getPermissionList(String permissionName, String menuId,
            String sectionId, String limit, String offset, HttpServletRequest httpServletRequest) throws BaseException {
        try {
            userActivityLogInterface.logUserActivity("View All Permissions", MDC.get(AdminAuthConstant.TRACE_ID),
                    actionLogMsgCreator.createMsgForGetPermission(permissionName, menuId, sectionId),
                    httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"View");
            CommonSouthBoundResponse<List<PermissionView>> response = permissionManagementClient
                    .getPermissionList(permissionName, menuId, sectionId, limit, offset);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilderWithPageInformation(response.getResponseData(),
                    response.getResult().getResultDescription(),
                    response.getResult().getResultCode(), response.getResult().getPageDetail());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<List<PermissionView>> getFilteredPermissionList(
            TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) {
        try {
            userActivityLogInterface.logUserActivity("View All Permissions", MDC.get(AdminAuthConstant.TRACE_ID),
                    actionLogMsgCreator.createMsgForFilterUserList(tableFilterRequest.getFilterValues()),
                    httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Filter");
            CommonSouthBoundResponse<List<PermissionView>> response = permissionManagementClient
                    .getFilteredPermissionList(tableFilterRequest);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilderWithPageInformation(response.getResponseData(),
                    response.getResult().getResultDescription(),
                    response.getResult().getResultCode(), response.getResult().getPageDetail());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<PermissionDetails> getPermissionDetails(String permissionId,
            HttpServletRequest httpServletRequest) throws BaseException {
        try {
            userActivityLogInterface.logUserActivity("View Permission Full Details",
                    MDC.get(AdminAuthConstant.TRACE_ID), "PermissionId: " + permissionId,
                    httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"View");
            CommonSouthBoundResponse<PermissionDetails> response = permissionManagementClient
                    .getPermissionDetails(permissionId);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                    response.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<AllActions> getActionHierarchy(String componentId) throws BaseException {
        CommonSouthBoundResponse<AllActions> response = permissionManagementClient.getActionHierarchy(componentId);
        return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                response.getResult().getResultCode());
    }

    @Override
    public CommonNorthBoundResponse<List<MenuComponents>> getAllMenuAndComponents() throws BaseException {
        CommonSouthBoundResponse<List<MenuComponents>> response = permissionManagementClient.getAllMenuAndComponents();
        return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                response.getResult().getResultCode());
    }

    @Override
    public CommonNorthBoundResponse<String> createPermission(CreatePermission createPermission,
            HttpServletRequest httpServletRequest) throws BaseException {
        try {
            userActivityLogInterface.logUserActivity("Create Permission", MDC.get(AdminAuthConstant.TRACE_ID),
                    createPermission.toString(), httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Add");
            CommonSouthBoundResponse<String> response = permissionManagementClient.createPermission(createPermission);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(null, response.getResult().getResultDescription(),
                    response.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.CREATE_PERMISSION_FAILED.description(),
                    DisplayResultCodeEnum.CREATE_PERMISSION_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.CREATE_PERMISSION_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<String> editPermission(EditPermission editPermission,
            HttpServletRequest httpServletRequest) throws BaseException {
        try {
            userActivityLogInterface.logUserActivity("Update Permission", MDC.get(AdminAuthConstant.TRACE_ID),
                    editPermission.toString(), httpServletRequest.getRequestURI(),
                    jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Update");
            CommonSouthBoundResponse<String> response = permissionManagementClient.editPermission(editPermission);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS,
                    ServiceConstants.SUCCESS_DESCRIPTION);
            return handler.responseBuilder(null, response.getResult().getResultDescription(),
                    response.getResult().getResultCode());
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                    e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL,
                    ex.getMessage());
            throw new BaseException(DisplayResultCodeEnum.EDIT_PERMISSION_FAILED.description(),
                    DisplayResultCodeEnum.EDIT_PERMISSION_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                    DisplayResultCodeEnum.EDIT_PERMISSION_FAILED.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<List<PermissionMetaData>> getPermissionMetaData() throws BaseException {
        CommonSouthBoundResponse<List<PermissionMetaData>> response = permissionManagementClient
                .getPermissionMetaData();
        return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                response.getResult().getResultCode());
    }
}

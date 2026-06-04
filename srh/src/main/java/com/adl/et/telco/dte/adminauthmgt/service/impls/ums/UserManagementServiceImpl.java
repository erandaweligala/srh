package com.adl.et.telco.dte.adminauthmgt.service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.client.ums.UserManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.*;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserManagementInterface;
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
public class UserManagementServiceImpl implements UserManagementInterface {

        private final UserManagementClient userManagementClient;
        private final ResponseHandler handler;
        private final UserActivityLogInterface userActivityLogInterface;
        private final JwtService jwtService;
        private final ActionLogMsgCreator actionLogMsgCreator;

        @Override
        public CommonNorthBoundResponse<UserDetails> getUserDetails(String userId,
                        HttpServletRequest httpServletRequest) {
                try {
                        userActivityLogInterface.logUserActivity("Retrieve User Details",
                                        MDC.get(AdminAuthConstant.TRACE_ID), "User ID :" + userId,
                                        httpServletRequest.getRequestURI(),
                                        jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Filter");
                        CommonSouthBoundResponse<UserDetails> response = userManagementClient.getUserDetails(userId);
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
                        return handler.responseBuilder(response.getResponseData(),
                                        response.getResult().getResultDescription(),
                                        response.getResult().getResultCode());
                } catch (BaseException e) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, e.getMessage());
                        throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                                        e.getStackTrace());
                } catch (Exception ex) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, ex.getMessage());
                        throw new BaseException(DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.description(),
                                        DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.description(),
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.code(), ex.getStackTrace());
                }
        }

        @Override
        public CommonNorthBoundResponse<String> createUser(CreateUserRequest newUser,
                        HttpServletRequest httpServletRequest) {
                try {
                        newUser.setCreatedBy(jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)));
                        userActivityLogInterface.logUserActivity("Create User", MDC.get(AdminAuthConstant.TRACE_ID),
                                        newUser.toString(), httpServletRequest.getRequestURI(),
                                        jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Add");
                        CommonSouthBoundResponse<String> response = userManagementClient.createUser(newUser);
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
                        return handler.responseBuilder(null, response.getResult().getResultDescription(),
                                        response.getResult().getResultCode());
                } catch (BaseException e) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, e.getMessage());
                        throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                                        e.getStackTrace());
                } catch (Exception ex) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, ex.getMessage());
                        throw new BaseException(DisplayResultCodeEnum.CREATE_USER_FAILED.description(),
                                        DisplayResultCodeEnum.CREATE_USER_FAILED.name(),
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        DisplayResultCodeEnum.CREATE_USER_FAILED.code(), ex.getStackTrace());
                }
        }

        @Override
        public CommonNorthBoundResponse<String> editUser(EditUserRequest user, HttpServletRequest httpServletRequest) {
                try {
                        userActivityLogInterface.logUserActivity("Update User", MDC.get(AdminAuthConstant.TRACE_ID),
                                        user.toString(), httpServletRequest.getRequestURI(),
                                        jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Update");
                        user.setUpdatedBy(jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)));
                        CommonSouthBoundResponse<String> response = userManagementClient.editUser(user);
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
                        return handler.responseBuilder(null, response.getResult().getResultDescription(),
                                        response.getResult().getResultCode());
                } catch (BaseException e) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, e.getMessage());
                        throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                                        e.getStackTrace());
                } catch (Exception ex) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, ex.getMessage());
                        throw new BaseException(DisplayResultCodeEnum.EDIT_USER_FAILED.name(),
                                        DisplayResultCodeEnum.EDIT_USER_FAILED.name(), HttpStatus.INTERNAL_SERVER_ERROR,
                                        DisplayResultCodeEnum.EDIT_USER_FAILED.code(), ex.getStackTrace());
                }
        }

        @Override
        public CommonNorthBoundResponse<EmailValidateResponse> validateEmail(
                        EmailValidationRequest emailValidationRequest, HttpServletRequest httpServletRequest) {
                CommonSouthBoundResponse<EmailValidateResponse> response = userManagementClient
                                .validateEmail(emailValidationRequest);
                return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                                response.getResult().getResultCode());

        }

        @Override
        public CommonNorthBoundResponse<List<MetaData>> getUserStatusMetaData(HttpServletRequest httpServletRequest) {
                CommonSouthBoundResponse<List<MetaData>> response = userManagementClient.getUserStatusMetaData();
                return handler.responseBuilder(response.getResponseData(), response.getResult().getResultDescription(),
                                response.getResult().getResultCode());
        }

        @Override
        public CommonNorthBoundResponse<List<AllUserDetails>> getAllUsers(String limit, String offset, String userName,
                        String roleId, String statusId, HttpServletRequest httpServletRequest) {
                try {
                        userActivityLogInterface.logUserActivity("View User List", MDC.get(AdminAuthConstant.TRACE_ID),
                                        actionLogMsgCreator.createMsgForGetUserList(userName, roleId, statusId, null),
                                        httpServletRequest.getRequestURI(),
                                        jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Filter");
                        CommonSouthBoundResponse<List<AllUserDetails>> response = userManagementClient
                                        .getAllUsers(limit, offset, userName, roleId, statusId);
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
                        return handler.responseBuilderWithPageInformation(response.getResponseData(),
                                        response.getResult().getResultDescription(),
                                        response.getResult().getResultCode(), response.getResult().getPageDetail());
                } catch (BaseException e) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, e.getMessage());
                        throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                                        e.getStackTrace());
                } catch (Exception ex) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, ex.getMessage());
                        throw new BaseException(DisplayResultCodeEnum.GET_ALL_USER_FAILED.description(),
                                        DisplayResultCodeEnum.GET_ALL_USER_FAILED.name(),
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        DisplayResultCodeEnum.GET_ALL_USER_FAILED.code(), ex.getStackTrace());
                }
        }

        @Override
        public CommonNorthBoundResponse<List<AllUserDetails>> getAllFilteredUserList(
                        TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) {
                try {
                        userActivityLogInterface.logUserActivity("View User List", MDC.get(AdminAuthConstant.TRACE_ID),
                                        actionLogMsgCreator.createMsgForFilterUserList(
                                                        tableFilterRequest.getFilterValues()),
                                        httpServletRequest.getRequestURI(),
                                        jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)),null,"Filter");
                        CommonSouthBoundResponse<List<AllUserDetails>> response = userManagementClient
                                        .getAllFilteredUserList(tableFilterRequest);
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
                        return handler.responseBuilderWithPageInformation(response.getResponseData(),
                                        response.getResult().getResultDescription(),
                                        response.getResult().getResultCode(), response.getResult().getPageDetail());
                } catch (BaseException e) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, e.getMessage());
                        throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(),
                                        e.getStackTrace());
                } catch (Exception ex) {
                        userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID),
                                        ServiceConstants.FAILED_CAPITAL, ex.getMessage());
                        throw new BaseException(DisplayResultCodeEnum.GET_ALL_USER_FAILED.description(),
                                        DisplayResultCodeEnum.GET_ALL_USER_FAILED.name(),
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        DisplayResultCodeEnum.GET_ALL_USER_FAILED.code(), ex.getStackTrace());
                }

        }
}

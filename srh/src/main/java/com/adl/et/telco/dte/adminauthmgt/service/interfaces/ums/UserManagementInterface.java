package com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface UserManagementInterface {
    CommonNorthBoundResponse<UserDetails> getUserDetails(String userId, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<String> createUser(CreateUserRequest newUser, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<String> editUser(EditUserRequest user, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<EmailValidateResponse> validateEmail(EmailValidationRequest emailValidationRequest, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<List<MetaData>> getUserStatusMetaData(HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<List<AllUserDetails>> getAllUsers(String limit, String offset, String userName, String roleId, String statusId, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<List<AllUserDetails>> getAllFilteredUserList(TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest);
}


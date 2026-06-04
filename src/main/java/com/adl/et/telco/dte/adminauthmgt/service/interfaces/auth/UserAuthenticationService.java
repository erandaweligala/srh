package com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth;

import com.adl.et.telco.dte.adminauthmgt.dto.authentication.AccessTokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;

import jakarta.servlet.http.HttpServletRequest;

public interface UserAuthenticationService {
    CommonNorthBoundResponse<AccessTokenResponse> login(String requestVerificationToken, UserLoginRequest tempToken) throws BaseException;

    CommonNorthBoundResponse<AccessTokenResponse> newAccessToken(String requestVerificationToken, HttpServletRequest request) throws BaseException;

    CommonNorthBoundResponse<String> userLogOut(HttpServletRequest httpServletRequest);
}

package com.adl.et.telco.dte.adminauthmgt.controller.auth;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.AccessTokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenEnhancementRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.UserAuthenticationService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.CookieService;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@Slf4j
@RequestMapping(value = "/srh/auth")
@RequiredArgsConstructor
public class UserAuthentcationController extends BaseController {
    private final UserAuthenticationService userAuthenticationService;

    private final CookieService cookieService;

    /**
     * Validate temp token and rv-token and create access token
     *
     * @param rvToken
     * @return
     * @throws BaseException
     * @body userLoginRequest
     */

    @PostMapping({"/user/login"})
    public ResponseEntity<CommonNorthBoundResponse<AccessTokenResponse>> userLogin(@RequestBody UserLoginRequest userLoginRequest, HttpServletResponse response, @CookieValue(value = "rv_token", defaultValue = "") String rvToken,
                                                                                   HttpServletRequest httpServletRequest) throws BaseException {
        CommonNorthBoundResponse<AccessTokenResponse> accessToken = userAuthenticationService.login(rvToken, userLoginRequest);
        response.addCookie(cookieService.createCookie(accessToken.getData().getRequestVerificationToken()));
        return setResponseEntity(accessToken);
    }


    /**
     * Log out user
     * @return
     * @throws BaseException
     */
    @DeleteMapping({"/user/logout"})
    public ResponseEntity<CommonNorthBoundResponse<String>> userLogOut(HttpServletRequest httpServletRequest) throws BaseException {
        CommonNorthBoundResponse<String> accessToken = userAuthenticationService.userLogOut(httpServletRequest);
        return setResponseEntity(accessToken);
    }


    /**
     * Get new access token with existing token
     *
     * @param rvToken
     * @return
     * @throws BaseException
     */

    @GetMapping({"/user/new-access-token"})
    public ResponseEntity<CommonNorthBoundResponse<AccessTokenResponse>> getNewAccessToken(HttpServletRequest httpServletRequest,HttpServletResponse response, @CookieValue(value = "rv_token", defaultValue = "") String rvToken) throws BaseException {
        CommonNorthBoundResponse<AccessTokenResponse> accessToken = userAuthenticationService.newAccessToken(rvToken,httpServletRequest);
        response.addCookie(cookieService.createCookie(accessToken.getData().getRequestVerificationToken()));
        return setResponseEntity(accessToken);
    }


}

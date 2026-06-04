package com.adl.et.telco.dte.adminauthmgt.controller.auth;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.AccessTokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.CredentialUserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenEnhancementRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.CredentialUserAuthenticationService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.CookieService;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@Slf4j
@RequestMapping(value = "/srh/credential-auth")
@RequiredArgsConstructor
public class CredentialAuthController extends BaseController {

    private final CredentialUserAuthenticationService userAuthenticationService;
    private final CookieService cookieService;

    private static final String LOG_PREFIX = "SRH|UserAuthenticationController|";

    @PostMapping("/user/login")
    public ResponseEntity<CommonNorthBoundResponse<AccessTokenResponse>> userLogin(@RequestBody CredentialUserLoginRequest userLoginRequest,
                                                                                   HttpServletResponse response,
                                                                                   @CookieValue(value = "rv_token", defaultValue = "") String rvToken,
                                                                                   HttpServletRequest httpServletRequest) throws BaseException {

        long startTime = System.currentTimeMillis();
        log.debug("{}userLogin|Start|Code: {}|ApplicationId: {}|RVTokenPresent: {}", LOG_PREFIX, userLoginRequest.getCode(), !rvToken.isEmpty());

        try {
            CommonNorthBoundResponse<AccessTokenResponse> accessToken = userAuthenticationService.login(rvToken, userLoginRequest);
            response.addCookie(cookieService.createCookie(accessToken.getData().getRequestVerificationToken()));
            log.info("{}userLogin|End|Success|Code: {}|Duration: {} ms", LOG_PREFIX, userLoginRequest.getCode(), (System.currentTimeMillis() - startTime));

            return setResponseEntity(accessToken);
        } catch (Exception e) {
            log.error("{}userLogin|Error|Code: {}|Error: {}", LOG_PREFIX, userLoginRequest.getCode(), e.getMessage(), e);
            throw e;
        }
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
    public ResponseEntity<CommonNorthBoundResponse<AccessTokenResponse>> getNewAccessToken(HttpServletRequest httpServletRequest,
                                                                                           HttpServletResponse response,
                                                                                           @RequestParam(value = "productType", required = false) String productType,
                                                                                           @CookieValue(value = "rv_token", defaultValue = "") String rvToken) throws BaseException {
        CommonNorthBoundResponse<AccessTokenResponse> accessToken = userAuthenticationService.newAccessToken(rvToken, httpServletRequest);
        response.addCookie(cookieService.createCookie(accessToken.getData().getRequestVerificationToken()));
        return setResponseEntity(accessToken);
    }

    @PostMapping("/user/enhance/token")
    public ResponseEntity<CommonNorthBoundResponse<AccessTokenResponse>> getEnhanceAccessToken(HttpServletRequest httpServletRequest,
                                                                                               @RequestBody TokenEnhancementRequest request,
                                                                                               HttpServletResponse response,
                                                                                               @CookieValue(value = "rv_token", defaultValue = "") String rvToken,
                                                                                               @RequestParam(value = "productType", required = false) String productType) {

        long startTime = System.currentTimeMillis();
        log.debug("{}getEnhanceAccessToken|Start|ProductType: {}|RVTokenPresent: {}", LOG_PREFIX, productType, !rvToken.isEmpty());

        try {
            CommonNorthBoundResponse<AccessTokenResponse> accessToken = userAuthenticationService.enhanceAccessToken(request, rvToken, httpServletRequest, productType);

            response.addCookie(cookieService.createCookie(accessToken.getData().getRequestVerificationToken()));
            log.info("{}getEnhanceAccessToken|End|Success|Duration: {} ms", LOG_PREFIX, (System.currentTimeMillis() - startTime));

            return setResponseEntity(accessToken);
        } catch (Exception e) {
            log.error("{}getEnhanceAccessToken|Error|Error: {}", LOG_PREFIX, e.getMessage(), e);
            throw e;
        }
    }
}

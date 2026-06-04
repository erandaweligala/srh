/**
 * Copyrights 2020 Axiata Digital Labs Pvt Ltd.
 * All Rights Reserved.
 * <p>
 * These material are unpublished, proprietary, confidential source
 * code of Axiata Digital Labs Pvt Ltd (ADL) and constitute a TRADE
 * SECRET of ADL.
 * <p>
 * ADL retains all title to and intellectual property rights in these
 * materials.
 */
package com.adl.et.telco.dte.adminauthmgt.service.impls.auth;


import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.AccessTokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.CredentialUserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenEnhancementRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserDetailsForToken;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.CredentialUserAuthenticationService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class CredentialUserAuthenticationServiceImpl implements CredentialUserAuthenticationService {
    private static final String LOG_PREFIX = "SRH|UserAuthenticationService|";
    private static final String START = "START";
    private static final String ERROR = "ERROR";
    private static final String SUCCESS = "SUCCESS";

    private final JwtService jwtService;
    private final CacheRepository cacheRepository;
    private final UserDetailClient umsUserClient;
    private final ResponseHandler responseHandler;

    @Value("${jwt.refresh.time.range.sec}")
    private long refreshTimeRange;

    @Value("${jwt.idle.time.range.sec}")
    private long timeLimitAC;

    @Value("${prefix.ac}")
    private String prefixAC;

    @Value("${prefix.temp}")
    private String tempTokenPrefix;


    @Override
    public CommonNorthBoundResponse<AccessTokenResponse> login(String requestVerificationToken, CredentialUserLoginRequest userLoginRequest) throws BaseException {
        log.info("{}|{}|Login attempt for productId: {}, tenant: {}", LOG_PREFIX, START, userLoginRequest.getTenant());
        try {
            String userName = umsUserClient.getUserName(userLoginRequest).getResponseData();    // to get username from keycloak
            userName = extractUsername(userName);

            log.debug("{}|Extracted username: {}", LOG_PREFIX, userName);

            if (cacheRepository.existsByUserId(userName)) {
                log.warn("{}|{}|Login rejected - active session exists for userId: {}", LOG_PREFIX, ERROR, userName);
                throw new BaseException(
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.description(),
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.description(),
                        HttpStatus.CONFLICT,
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.code(),
                        null
                );
            }

            Map<String, String> accessTokenMap = createAccessToken(userName, userLoginRequest.getTenant());
            cacheRepository.deleteKey(tempTokenPrefix + userName);

            String newRequestVerificationToken = UUID.randomUUID().toString();
            cacheRepository.save(prefixAC + userName, newRequestVerificationToken, timeLimitAC);

            log.info("{}|{}|Login successful for userId: {}", LOG_PREFIX, SUCCESS, userName);
            return responseHandler.responseBuilder(
                    new AccessTokenResponse(accessTokenMap.get(ServiceConstants.TOKEN), newRequestVerificationToken),
                    AuthCodeEnum.LOGIN_SUCCESS.description(),
                    AuthCodeEnum.LOGIN_SUCCESS.code()
            );
        } catch (BaseException ex) {
            log.error("{}|{}|BaseException during login: {}", LOG_PREFIX, ERROR, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("{}|{}|Unexpected error during login: {}", LOG_PREFIX, ERROR, ex.getMessage(), ex);
            throw new BaseException(
                    ex.getMessage(),
                    AuthCodeEnum.LOGIN_INTERNAL_SERVER_ERROR.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    AuthCodeEnum.LOGIN_INTERNAL_SERVER_ERROR.code(),
                    ex.getStackTrace()
            );
        }
    }

    private String extractUsername(String input) {
        if (input == null || input.isEmpty()) {
            return null;
        }

        Pattern pattern = Pattern.compile(Constants.EMAIL_REGEX);
        Matcher matcher = pattern.matcher(input);

        return matcher.matches() ? input.split("@")[0] : input;
    }

    public Map<String, String> createAccessToken(String username, String tenantId) throws BaseException {
        Map<String, Object> claimsMap = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();
        try {
            UserDetailsForToken infoByUserId = umsUserClient.getUserDetails(username).getResponseData();
            if (!infoByUserId.getStatus().equalsIgnoreCase(Constants.ACTIVE))
                throw new BaseException(AuthCodeEnum.INVALID_USER_STATUS.description(), AuthCodeEnum.INVALID_USER_STATUS.description(), HttpStatus.BAD_REQUEST, AuthCodeEnum.INVALID_USER_STATUS.code(), null);

            claimsMap.put(ServiceConstants.PERMISSIONS, infoByUserId.getPermission());
            claimsMap.put(ServiceConstants.EMAIL, infoByUserId.getEmail());
            claimsMap.put(ServiceConstants.U_NAME, infoByUserId.getName());
            claimsMap.put(ServiceConstants.ROLE, infoByUserId.getRole());
            claimsMap.put(ServiceConstants.TENANT_ID, tenantId);
            jwtService.generateAccessToken(username, claimsMap, tokenMap);
            log.debug("{}|{}|Access token generated for username: {}", LOG_PREFIX, SUCCESS, username);
            return tokenMap;
        } catch (BaseException ex){
            log.error("{}|{}|Invalid user for userId: {}: {}",LOG_PREFIX, ERROR, username, ex.getMessage(), ex);
            throw ex;
        } catch (RuntimeException ex) {
            log.error("{}|{}|RuntimeException during access token creation for userId: {}: {}",LOG_PREFIX, ERROR, username, ex.getMessage(), ex);
            throw new BaseException(ex.getMessage(), AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getStackTrace());
        }
    }


    @Override
    public CommonNorthBoundResponse<AccessTokenResponse> newAccessToken(String requestVerificationToken, HttpServletRequest request) throws BaseException {
        log.info("{}|{}|Generating new access token for productType: {}", LOG_PREFIX, START);
        try {
            String jwtToken = jwtService.tokenExtractor(request);
            Date expTime = jwtService.extractExpiration(jwtToken);
            if (((expTime.getTime() - (new Date().getTime())) / 1000) > refreshTimeRange) {
                log.warn("{}|Not within refresh time range for token", LOG_PREFIX);
                throw new BaseException(AuthCodeEnum.NOT_IN_REFRESH_TIME.description(), AuthCodeEnum.NOT_IN_REFRESH_TIME.description(), HttpStatus.BAD_REQUEST, AuthCodeEnum.NOT_IN_REFRESH_TIME.code(), null);
            }

            String userId = jwtService.extractUsername(jwtToken);
            Map<String, String> accessTokenMap = createAccessToken(userId, null);

            String existingRvToken = cacheRepository.findByKey(prefixAC + userId);
            cacheRepository.updateExpiryTime(prefixAC + userId, timeLimitAC);
            return responseHandler.responseBuilder(new AccessTokenResponse(accessTokenMap.get(ServiceConstants.TOKEN), existingRvToken), AuthCodeEnum.LOGIN_SUCCESS.description(), AuthCodeEnum.LOGIN_SUCCESS.code());

        } catch (BaseException ex) {
            throw new BaseException(ex.getMessage(), ex.getReason(), ex.getHttpStatus(), ex.getResultCode(), ex.getStackTraceElements());
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getStackTrace());
        }
    }


    @Override
    public CommonNorthBoundResponse<String> userLogOut(HttpServletRequest httpServletRequest) {
        log.info("{}|{}|Processing user logout request", LOG_PREFIX, START);
        try {
            String userName = jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest));
            cacheRepository.delete(userName);
            log.info("{}|{}|Redis cache cleared for user: {}", LOG_PREFIX, SUCCESS, userName);
            return responseHandler.responseBuilder(null, AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());
        } catch (BaseException ex) {
            log.error("{}|{}|BaseException during logout: {}", LOG_PREFIX, ERROR, ex.getMessage(), ex);
            throw new BaseException(ex.getMessage(), ex.getReason(), ex.getHttpStatus(), ex.getResultCode(), ex.getStackTraceElements());
        } catch (Exception ex) {
            log.error("{}|{}|Unexpected error during logout: {}", LOG_PREFIX, ERROR, ex.getMessage(), ex);
            throw new BaseException(ex.getMessage(), AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.code(), ex.getStackTrace());
        }
    }

    @Override
    public CommonNorthBoundResponse<AccessTokenResponse> enhanceAccessToken(TokenEnhancementRequest request, String rvToken, HttpServletRequest httpServletRequest, String productType) throws BaseException {
        return null;
    }

}

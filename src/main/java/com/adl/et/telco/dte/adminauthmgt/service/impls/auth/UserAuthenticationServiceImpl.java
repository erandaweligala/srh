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
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserDetailsForToken;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.UserAuthenticationService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class UserAuthenticationServiceImpl implements UserAuthenticationService {
    private static final Logger logger = LoggerFactory.getLogger(UserAuthenticationServiceImpl.class);
    @Autowired
    private JwtService jwtService;
    @Autowired
    private CacheRepository cacheRepository;
    @Autowired
    private UserDetailClient umsUserClient;
    @Autowired
    private ResponseHandler responseHandler;

    @Value("${jwt.refresh.time.range.sec}")
    private long refreshTimeRange;

    @Value("${jwt.idle.time.range.sec}")
    private long timeLimitAC;

    @Value("${prefix.ac}")
    private String prefixAC;

    @Value("${prefix.temp}")
    private String tempTokenPrefix;


    @Override
    public CommonNorthBoundResponse<AccessTokenResponse> login(String requestVerificationToken, UserLoginRequest tempToken) throws BaseException {
        try {
            String jwtToken = tempToken.getTempToken();
            String userId = jwtService.extractUsername(jwtToken);
            if (jwtToken == null || jwtToken.isEmpty()) {
                throw new BaseException(AuthCodeEnum.TEMP_TOKEN_MUST_NOT_BE_NULL.description(), AuthCodeEnum.TEMP_TOKEN_MUST_NOT_BE_NULL.description(), HttpStatus.FORBIDDEN, AuthCodeEnum.TEMP_TOKEN_MUST_NOT_BE_NULL.code(), null);
            }
            if (jwtService.isTokenExpired(jwtToken)) {
                throw new BaseException(AuthCodeEnum.TEMP_TOKEN_EXPIRED.description(), AuthCodeEnum.TEMP_TOKEN_EXPIRED.description(), HttpStatus.FORBIDDEN, AuthCodeEnum.TEMP_TOKEN_EXPIRED.code(), null);
            }
            if (!jwtService.isValidTempToken(jwtToken)) {
                throw new BaseException(AuthCodeEnum.INVALID_TEMP_TOKEN.description(), AuthCodeEnum.INVALID_TEMP_TOKEN.description(), HttpStatus.FORBIDDEN, AuthCodeEnum.INVALID_TEMP_TOKEN.code(), null);
            }
            if (requestVerificationToken.isEmpty()) {
                throw new BaseException(AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.description(), AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.description(), HttpStatus.FORBIDDEN, AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.code(), null);
            }
            if (!jwtService.isValidRequestVerificationToken(jwtToken, requestVerificationToken)) {
                throw new BaseException(AuthCodeEnum.INVALID_RV_TOKEN.description(), AuthCodeEnum.INVALID_RV_TOKEN.description(), HttpStatus.FORBIDDEN, AuthCodeEnum.INVALID_RV_TOKEN.code(), null);
            }
            if (cacheRepository.existsByUserId(userId)) {
                logger.warn("Login rejected - active session exists for userId: {}", userId);
                throw new BaseException(
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.description(),
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.description(),
                        HttpStatus.CONFLICT,
                        AuthCodeEnum.USER_ALREADY_LOGGED_IN.code(),
                        null
                );
            }

            Map<String, String> accessTokenMap = createAccessToken(jwtToken);
            cacheRepository.deleteKey(tempTokenPrefix + userId);
            String newRequestVerificationToken = UUID.randomUUID().toString();
            cacheRepository.save(prefixAC + userId, newRequestVerificationToken, timeLimitAC);
            return responseHandler.responseBuilder(new AccessTokenResponse(accessTokenMap.get(ServiceConstants.TOKEN), newRequestVerificationToken), AuthCodeEnum.LOGIN_SUCCESS.description(), AuthCodeEnum.LOGIN_SUCCESS.code());
        } catch (BaseException ex) {
            throw new BaseException(ex.getMessage(), ex.getReason(), ex.getHttpStatus(), ex.getResultCode(), ex.getStackTraceElements());
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), AuthCodeEnum.LOGIN_INTERNAL_SERVER_ERROR.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.LOGIN_INTERNAL_SERVER_ERROR.code(), ex.getStackTrace());
        }
    }

    public Map<String, String> createAccessToken(String jwtToken) throws BaseException {
        Map<String, Object> claimsMap = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();
        try {
            String userId = jwtService.extractUsername(jwtToken);
            CommonSouthBoundResponse<UserDetailsForToken> infoByUserId = umsUserClient.getUserDetails(userId);
            claimsMap.put(ServiceConstants.PERMISSIONS, infoByUserId.getResponseData().getPermission());
            claimsMap.put(ServiceConstants.ROLE, infoByUserId.getResponseData().getRole());
            claimsMap.put(ServiceConstants.EMAIL, infoByUserId.getResponseData().getEmail());
            claimsMap.put(ServiceConstants.U_NAME, infoByUserId.getResponseData().getName());
            jwtService.generateAccessToken(userId, claimsMap, tokenMap);
            return tokenMap;

        } catch (RuntimeException ex) {
            throw new BaseException(ex.getMessage(), AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getStackTrace());
        }
    }


    @Override
    public CommonNorthBoundResponse<AccessTokenResponse> newAccessToken(String requestVerificationToken, HttpServletRequest request) throws BaseException {
        try {
            String jwtToken = jwtService.tokenExtractor(request);
            Date expTime = jwtService.extractExpiration(jwtToken);
            if (((expTime.getTime() - (new Date().getTime())) / 1000) > refreshTimeRange) {
                throw new BaseException(AuthCodeEnum.NOT_IN_REFRESH_TIME.description(), AuthCodeEnum.NOT_IN_REFRESH_TIME.description(), HttpStatus.BAD_REQUEST, AuthCodeEnum.NOT_IN_REFRESH_TIME.code(), null);
            }

            String userId = jwtService.extractUsername(jwtToken);
            Map<String, String> accessTokenMap = createAccessToken(jwtToken);

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
        logger.info("SRH|UserAuthenticationServiceImpl|START|Processing user logout request");
        try {
            String userName = jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest));
            cacheRepository.delete(userName);
            logger.info("SRH|UserAuthenticationServiceImpl|SUCCESS|Redis cache cleared for user: {}", userName);
            return responseHandler.responseBuilder(null, AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());
        } catch (BaseException ex) {
            logger.error("SRH|UserAuthenticationServiceImpl|ERROR|BaseException during logout: {}", ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getReason(), ex.getHttpStatus(), ex.getResultCode(), ex.getStackTraceElements());
        } catch (Exception ex) {
            logger.error("SRH|UserAuthenticationServiceImpl|ERROR|Unexpected error during logout: {}", ex.getMessage());
            throw new BaseException(ex.getMessage(), AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.code(), ex.getStackTrace());
        }
    }

}

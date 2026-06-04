package com.adl.et.telco.dte.adminauthmgt.client.auth;



import com.adl.et.telco.dte.adminauthmgt.dto.authentication.CredentialUserLoginRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserDetailsForToken;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.HttpEntityGenerator;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;


@Component
@RequiredArgsConstructor
public class UserDetailClient extends BaseClient {

    @Value("${ums.get-user-details-for-email.url}")
    private String getUserDetailsByEmail;

    @Value("${ums.get-basic-info-for-token.url}")
    private String getGetUserDetailsForTokenUrl;

    @Value("${ums.get-username-url}")
    private String getUserNameUrl;

    private final RestTemplate restTemplate;

    private final HttpEntityGenerator entityGenerator;


    public CommonSouthBoundResponse<UserDetailsForToken> getUserDetails(String userName) throws BaseException {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<UserDetailsForToken>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<UserDetailsForToken>>() {
            };
            ResponseEntity<CommonSouthBoundResponse<UserDetailsForToken>> exchange = restTemplate.exchange(getGetUserDetailsForTokenUrl, HttpMethod.GET, requestEntity, typeRef, userName);
            return exchange.getBody();
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), DisplayResultCodeEnum.GET_USER_BASIC_INFO_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_USER_BASIC_INFO_FAILED.code(), ex.getStackTrace());
        }
    }

    public CommonSouthBoundResponse<UserBasicInfo> getBasicUserDetails(String email) throws BaseException {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<UserBasicInfo>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<UserBasicInfo>>() {
            };
            ResponseEntity<CommonSouthBoundResponse<UserBasicInfo>> exchange = restTemplate.exchange(getUserDetailsByEmail, HttpMethod.GET, requestEntity, typeRef, email);
            return exchange.getBody();
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), DisplayResultCodeEnum.GET_USER_BASIC_INFO_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_USER_BASIC_INFO_FAILED.code(), ex.getStackTrace());
        }
    }

    public CommonSouthBoundResponse<String> getUserName(CredentialUserLoginRequest userLoginRequest) throws BaseException {
        try {
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<>() {
            };
            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(getUserNameUrl, HttpMethod.POST, populateRequestEntity(userLoginRequest), typeRef);
            return exchange.getBody();

        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), DisplayResultCodeEnum.GET_USERNAME_FAILED.description(), HttpStatus.INTERNAL_SERVER_ERROR, DisplayResultCodeEnum.GET_USERNAME_FAILED.code(), ex.getStackTrace());
        }
    }
}

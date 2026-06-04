package com.adl.et.telco.dte.adminauthmgt.client.ums;


import com.adl.et.telco.dte.adminauthmgt.client.auth.BaseClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.*;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.ExceptionHandler;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Component
@Slf4j
public class UserManagementClient extends BaseClient {

    @Autowired
    private ExceptionHandler exceptionHandler;
    @Autowired
    RestTemplate restTemplate;
    @Value("${ums.user.base-resource-url}")
    private String userManagementResourceUrl;
    @Value("${ums.user.validate-email}")
    private String userManagementResourceValidateUrl;

    @Value("${ums.user.status.meta-data}")
    private String userManagementResourceStateMetaDataUrl;

    @Value("${ums.user.expired-in-days}")
    private String userExpiredInDays;

    @Value("${ums.user.get-filtered-user-url}")
    private String getFilteredUserUrl;


    public CommonSouthBoundResponse<UserDetails> getUserDetails(String userId) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<UserDetails>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<UserDetails>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceUrl);
            adaptorUrl.pathSegment(userId);

            ResponseEntity<CommonSouthBoundResponse<UserDetails>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> createUser(CreateUserRequest newUser) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<CreateUserRequest> requestEntity = new HttpEntity<>(newUser, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceUrl);
            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.CREATE_USER_FAILED.description(),
                    DisplayResultCodeEnum.CREATE_USER_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> editUser(EditUserRequest user) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<EditUserRequest> requestEntity = new HttpEntity<>(user, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceUrl);
            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.PATCH, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.EDIT_USER_FAILED.description(),
                    DisplayResultCodeEnum.EDIT_USER_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<EmailValidateResponse> validateEmail(EmailValidationRequest emailValidationRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<EmailValidationRequest> requestEntity = new HttpEntity<>(emailValidationRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<EmailValidateResponse>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<EmailValidateResponse>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceValidateUrl);
            ResponseEntity<CommonSouthBoundResponse<EmailValidateResponse>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.VALIDATE_EMAIL_FAILED.description(),
                    DisplayResultCodeEnum.VALIDATE_EMAIL_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<MetaData>> getUserStatusMetaData() {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<MetaData>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<MetaData>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceStateMetaDataUrl);
            ResponseEntity<CommonSouthBoundResponse<List<MetaData>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_USER_STATUS_META_DATA_FAILED.description(),
                    DisplayResultCodeEnum.GET_USER_STATUS_META_DATA_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<AllUserDetails>> getAllUsers(String limit, String offset, String userName, String roleId, String statusId) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<AllUserDetails>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<AllUserDetails>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceUrl);
            adaptorUrl.queryParam(Constants.LIMIT, limit);
            adaptorUrl.queryParam(Constants.OFFSET, offset);
            if (userName != null)
                adaptorUrl.queryParam(Constants.USER_NAME, userName);
            if (roleId != null)
                adaptorUrl.queryParam(Constants.ROLE_ID, roleId);
            if (statusId != null)
                adaptorUrl.queryParam(Constants.STATUS_ID, statusId);
            ResponseEntity<CommonSouthBoundResponse<List<AllUserDetails>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ALL_USER_FAILED.description(),
                    DisplayResultCodeEnum.GET_ALL_USER_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> expireUsers() {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(userManagementResourceUrl);
            adaptorUrl.pathSegment("expire");
            adaptorUrl.pathSegment(userExpiredInDays);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            return restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef).getBody();
        } catch (IllegalArgumentException e) {
            log.error("SRH | Scheduler Exception in UserManagementClient.expireUsers.IllegalArgumentException | {}", e.getLocalizedMessage());
            throw e;
        } catch (RestClientException e) {
            log.error("SRH | Scheduler Exception in UserManagementClient.expireUsers.RestClientException | {}", e.getLocalizedMessage());
            throw e;
        }
    }

    public CommonSouthBoundResponse<List<AllUserDetails>> getAllFilteredUserList(TableFilterRequest tableFilterRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<TableFilterRequest> tableFilterRequestHttpEntity = new HttpEntity<>(tableFilterRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<AllUserDetails>>> typeRef = new ParameterizedTypeReference<>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(getFilteredUserUrl);
            ResponseEntity<CommonSouthBoundResponse<List<AllUserDetails>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, tableFilterRequestHttpEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ALL_USER_FAILED.description(),
                    DisplayResultCodeEnum.GET_ALL_USER_FAILED.code());
        }
    }
}

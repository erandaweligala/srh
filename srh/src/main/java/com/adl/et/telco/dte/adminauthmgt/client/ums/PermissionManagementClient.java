package com.adl.et.telco.dte.adminauthmgt.client.ums;


import com.adl.et.telco.dte.adminauthmgt.client.auth.BaseClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents.MenuComponents;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.ExceptionHandler;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class PermissionManagementClient extends BaseClient {

    private final ExceptionHandler exceptionHandler;
    private final RestTemplate restTemplate;

    @Value("${ums.permission.base-resource-url}")
    private String permissionManagementResourceUrl;

    public CommonSouthBoundResponse<List<PermissionView>> getPermissionList(String permissionName, String menuId, String sectionId, String limit, String offset) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionView>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionView>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.queryParam(Constants.LIMIT, limit);
            adaptorUrl.queryParam(Constants.OFFSET, offset);

            if (menuId != null)
                adaptorUrl.queryParam(Constants.MENU_ID, menuId);
            if (permissionName != null)
                adaptorUrl.queryParam(Constants.PERMISSION_NAME, permissionName);
            if (sectionId != null)
                adaptorUrl.queryParam(Constants.SECTION_ID, sectionId);

            ResponseEntity<CommonSouthBoundResponse<List<PermissionView>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_PERMISSION_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_LIST_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<PermissionDetails> getPermissionDetails(String permissionId) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<PermissionDetails>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<PermissionDetails>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.pathSegment(permissionId);

            ResponseEntity<CommonSouthBoundResponse<PermissionDetails>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_DETAILS_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<AllActions> getActionHierarchy(String componentId) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<AllActions>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<AllActions>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.pathSegment("action-hierarchy-for-create-permission");
            adaptorUrl.queryParam(Constants.COMPONENT_ID, componentId);

            ResponseEntity<CommonSouthBoundResponse<AllActions>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ACTION_TO_COMPONENT_FAILED.description(),
                    DisplayResultCodeEnum.GET_ACTION_TO_COMPONENT_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<MenuComponents>> getAllMenuAndComponents() {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<MenuComponents>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<MenuComponents>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.pathSegment("menu-components");

            ResponseEntity<CommonSouthBoundResponse<List<MenuComponents>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ALL_MENU_COMPONENT_FAILED.description(),
                    DisplayResultCodeEnum.GET_ALL_MENU_COMPONENT_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> createPermission(CreatePermission createPermission) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<CreatePermission> requestEntity = new HttpEntity<>(createPermission, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);

            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.CREATE_PERMISSION_FAILED.description(),
                    DisplayResultCodeEnum.CREATE_PERMISSION_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> editPermission(EditPermission editPermission) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<EditPermission> requestEntity = new HttpEntity<>(editPermission, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);

            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.PATCH, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.EDIT_PERMISSION_FAILED.description(),
                    DisplayResultCodeEnum.EDIT_PERMISSION_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<PermissionMetaData>> getPermissionMetaData() {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionMetaData>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionMetaData>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.pathSegment("meta-data");

            ResponseEntity<CommonSouthBoundResponse<List<PermissionMetaData>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_PERMISSION_META_DATA_FAILED.description(),
                    DisplayResultCodeEnum.GET_PERMISSION_META_DATA_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<PermissionView>> getFilteredPermissionList(TableFilterRequest tableFilterRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<TableFilterRequest> requestEntity = new HttpEntity<>(tableFilterRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionView>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<PermissionView>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(permissionManagementResourceUrl);
            adaptorUrl.pathSegment("permission-list");

            ResponseEntity<CommonSouthBoundResponse<List<PermissionView>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_FILTERED_PERMISSION_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_FILTERED_PERMISSION_LIST_FAILED.code());
        }
    }
}


package com.adl.et.telco.dte.adminauthmgt.client.ums;


import com.adl.et.telco.dte.adminauthmgt.client.auth.BaseClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.CreateNewRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleDetails;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleView;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.UpdateRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.ExceptionHandler;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
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
public class RoleManagementClient extends BaseClient {

    @Autowired
    private ExceptionHandler exceptionHandler;

    @Autowired
    RestTemplate restTemplate;

    @Value("${ums.role.base-resource-url}")
    private String roleManagementResourceUrl;
    @Value("${ums.role.meta-data-url}")
    private String roleManagementMetaDataUrl;
    @Value("${ums.role.filtered-url}")
    private String roleManagementFilteredUrl;

    public CommonSouthBoundResponse<List<RoleView>> getRoleList(int limit, int offset, String roleName) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<RoleView>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<RoleView>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementResourceUrl);
            adaptorUrl.queryParam(Constants.LIMIT,limit);
            adaptorUrl.queryParam(Constants.OFFSET,offset);
            if(roleName !=null)
                adaptorUrl.queryParam(Constants.ROLE_NAME,roleName);

            ResponseEntity<CommonSouthBoundResponse<List<RoleView>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_LIST_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<RoleDetails> getRoleDetails(String roleId) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<RoleDetails>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<RoleDetails>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementResourceUrl);
            adaptorUrl.pathSegment(roleId);

            ResponseEntity<CommonSouthBoundResponse<RoleDetails>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ROLE_DETAILS_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_DETAILS_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> createRole(CreateNewRole createNewRoleRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<CreateNewRole> requestEntity = new HttpEntity<>(createNewRoleRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementResourceUrl);

            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {

            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.CREATE_ROLE_FAILED.description(),
                    DisplayResultCodeEnum.CREATE_ROLE_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<String> updateRole(UpdateRole updateRoleRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<UpdateRole> requestEntity = new HttpEntity<>(updateRoleRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<String>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<String>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementResourceUrl);

            ResponseEntity<CommonSouthBoundResponse<String>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.PATCH, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.UPDATE_ROLE_FAILED.description(),
                    DisplayResultCodeEnum.UPDATE_ROLE_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<MetaData>> getRoleMetaData() {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<String> requestEntity = new HttpEntity<>(null, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<MetaData>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<MetaData>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementMetaDataUrl);

            ResponseEntity<CommonSouthBoundResponse<List<MetaData>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.GET, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_ROLE_META_DATA_FAILED.description(),
                    DisplayResultCodeEnum.GET_ROLE_META_DATA_FAILED.code());
        }
    }

    public CommonSouthBoundResponse<List<RoleView>> getFilteredRoleList(TableFilterRequest tableFilterRequest) {
        try {
            HttpHeaders headers = populateHeadersWithTenant();
            HttpEntity<TableFilterRequest> requestEntity = new HttpEntity<>(tableFilterRequest, headers);
            ParameterizedTypeReference<CommonSouthBoundResponse<List<RoleView>>> typeRef = new ParameterizedTypeReference<CommonSouthBoundResponse<List<RoleView>>>() {
            };
            UriComponentsBuilder adaptorUrl = UriComponentsBuilder.fromUriString(roleManagementFilteredUrl);

            ResponseEntity<CommonSouthBoundResponse<List<RoleView>>> exchange = restTemplate.exchange(adaptorUrl.build().toString(), HttpMethod.POST, requestEntity, typeRef);
            return exchange.getBody();
        } catch (RestClientException ex) {
            throw exceptionHandler.clientExceptionHandler(ex, DisplayResultCodeEnum.GET_FILTERED_ROLE_LIST_FAILED.description(),
                    DisplayResultCodeEnum.GET_FILTERED_ROLE_LIST_FAILED.code());
        }
    }
}

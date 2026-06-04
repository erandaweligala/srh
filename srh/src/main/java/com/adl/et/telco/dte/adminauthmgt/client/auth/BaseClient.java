package com.adl.et.telco.dte.adminauthmgt.client.auth;


import com.adl.et.telco.dte.adminauthmgt.dto.common.RequestContextDetail;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

public class BaseClient {

    @Value("${tenant-id}")
    String tenantId;

    public HttpHeaders populateHeaders(){
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", RequestContextDetail.getRequestID());
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public HttpHeaders populateHeadersWithTenant(){
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Correlation-Id", RequestContextDetail.getRequestID());
        headers.set(Constants.TENANT_ID,tenantId);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public <T> HttpEntity<T> populateRequestEntity(T body) {
        HttpHeaders headers = populateHeadersWithTenant();
        return new HttpEntity<>(body, headers);
    }

    public HttpEntity<String> populateRequestEntity() {
        HttpHeaders headers = populateHeadersWithTenant();
        return new HttpEntity<>(null, headers);
    }
}


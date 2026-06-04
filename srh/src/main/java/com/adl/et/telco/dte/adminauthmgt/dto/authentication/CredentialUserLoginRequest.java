package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class CredentialUserLoginRequest {
    private String code;
    private String tenant;
    private String clientId;
    private String redirectUri;
}

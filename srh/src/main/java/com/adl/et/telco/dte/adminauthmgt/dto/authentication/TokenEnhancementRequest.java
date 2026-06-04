package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Data;

@Data
public class TokenEnhancementRequest {
    private String tenant;
    private String clientId;
    private Integer loginSystemId;
}

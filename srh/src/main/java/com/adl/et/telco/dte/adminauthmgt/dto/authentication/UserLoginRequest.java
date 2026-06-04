package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class UserLoginRequest {
    private String tempToken;
}

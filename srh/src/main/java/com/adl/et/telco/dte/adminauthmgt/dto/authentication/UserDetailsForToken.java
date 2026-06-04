package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UserDetailsForToken {
    private String userName;
    private String name;
    private String role;
    private String email;
    private String msisdn;
    private PermissionDTO permission;
    private String status;
    private String lastLogin;
    private String tid;
}

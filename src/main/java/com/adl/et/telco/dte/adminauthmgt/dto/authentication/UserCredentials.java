package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Ishara_105122
 * @version 1.0
 * @since 6/9/2021
 */

@Getter
@Setter
@ToString
public class UserCredentials {
    private String username;
    private String password;
}

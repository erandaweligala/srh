package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.*;

/**
 * @author Ishara_105122
 * @version 1.0
 * @since 6/9/2021
 */

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class UserBasicInfo {
    private String lastLoginDateTime;
    private String mobileNumber;
    private String roleId;
    private String name;
    private String username;
    private String roleName;
    private String userId;
    private String email;
    private String status;
}

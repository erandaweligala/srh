package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllUserDetails {
    private String name;
    private String userId;
    private String email;
    private String status;
    private String roleName;
    private String userAccount;
    private String mobileNumber;
    private String lastLoginTime;
    private String userType;
    private String defaultGroup;
    private String userGroup;
    private String createdDate;
    private Integer totalCount;
}

package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EditUserRequest {
    private String userId;
    private String roleId;
    private String mobileNumber;
    private String name;
    private String email;
    private String status;
    private String updatedBy;
}

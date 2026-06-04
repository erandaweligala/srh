package com.adl.et.telco.dte.adminauthmgt.dto.ums.role;

import lombok.*;

import java.util.List;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRole {
    private List<Long> permissionIdList;
    private String roleName;
    private String description;
    private String createdBy;
    private String roleId;
}
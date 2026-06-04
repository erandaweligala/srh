package com.adl.et.telco.dte.adminauthmgt.dto.ums.role;

import lombok.*;

import java.util.List;
@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateNewRole{
    private List<Long> permissionIdList;
    private String roleName;
    private String description;
    private String createdBy;
}
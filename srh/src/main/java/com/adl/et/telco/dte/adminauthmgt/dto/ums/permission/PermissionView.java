package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionView{
    private String permissionId;
    private String name;
    private String description;
    private String menuName;
    private String componentName;
    private Integer totalCount;
}

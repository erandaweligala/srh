package com.adl.et.telco.dte.adminauthmgt.dto.ums.role;

import lombok.*;

@Setter
@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RoleDetailsRepoDTO{
    private String permissionId;
    private String componentId;
    private String roleId;
    private String roleName;
    private String menuId;
    private String description;
    private String menuName;
    private String componentName;
    private String permissionDescription;
    private String permissionName;
}

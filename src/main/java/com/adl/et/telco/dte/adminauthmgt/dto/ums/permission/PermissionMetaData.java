package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionMetaData{
    private String permissionId;
    private String componentId;
    private String menuId;
    private String menuName;
    private String componentName;
    private String permissionName;

    private String permissionDescription;
}

package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionDetailsResultSet{
    private Long attributeId;
    private Integer isManinAction;
    private Integer attributeIsSelected;
    private Long actionId;
    private String attributeName;
    private Integer actionIsSelected;
    private Long mainActionId;
    private String actionName;
}

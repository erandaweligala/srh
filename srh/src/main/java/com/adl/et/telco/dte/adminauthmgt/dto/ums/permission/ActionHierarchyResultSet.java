package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActionHierarchyResultSet {
    private Long attributeId;
    private Integer isManinAction;
    private Long actionId;
    private String attributeName;
    private Long mainActionId;
    private String actionName;
}

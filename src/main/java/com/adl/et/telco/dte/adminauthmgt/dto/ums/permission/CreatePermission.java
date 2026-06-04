package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

import java.util.List;
@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
public class CreatePermission{
    private String componentId;
    private String createdBy;
    private String name;
    private String menuId;
    private String description;
    private List<Long> attributes;
    private List<Long> actions;
}
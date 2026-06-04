package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents;

import lombok.*;

import java.util.List;
@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuComponents{
    private List<ComponentsItem> components;
    private String menuId;
    private String menuName;
}
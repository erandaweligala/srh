package com.adl.et.telco.dte.adminauthmgt.dto.ums.permission;

import lombok.*;

import java.util.List;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllActions {
    private List<MainActionsItem> mainActions;
}
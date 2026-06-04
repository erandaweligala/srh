package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterValue {
    private String columnName;
    private String operation;
    private String[] value;
}

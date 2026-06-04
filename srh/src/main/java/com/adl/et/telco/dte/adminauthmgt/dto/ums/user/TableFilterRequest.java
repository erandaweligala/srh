package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableFilterRequest {
    private List<FilterValue> filterValues;
    private String tableTemplateId;
    private Boolean defaultTableTemplate;
    @NotNull(message = "Offset is mandatory")
    @Min(value = 0, message = "Offset must be 0 or greater")
    private Integer offset;
    @NotNull(message = "Limit is mandatory")
    @Min(value = 1, message = "Limit must be 1 or greater")
    private Integer limit;
}

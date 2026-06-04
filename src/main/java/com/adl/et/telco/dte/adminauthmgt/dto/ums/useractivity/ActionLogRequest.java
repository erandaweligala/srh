package com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionLogRequest {
    private String activity;
    private String activityId;
    private String detailedRequest;
    private String url;
    private String status;
    private String statusDescription;
    private String user;
    private boolean isUpdate;
}

package com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SingleActionLogResponse {
    private String activityId;
    private String activity;
    private String createdDateTime;
    private String updatedDateTime;
    private String detailedRequest;
    private String status;
    private String statusDescription;
    private String url;
    private String user;
}

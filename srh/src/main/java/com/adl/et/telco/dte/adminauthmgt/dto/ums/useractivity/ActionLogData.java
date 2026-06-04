package com.adl.et.telco.dte.adminauthmgt.dto.ums.useractivity;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ActionLogData {
    private Long id;
    private String activityId;
    private String activity;
    private String status;
    private String user;
    private String createdDateTime;
}

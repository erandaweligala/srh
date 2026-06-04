package com.adl.et.telco.dte.adminauthmgt.dto.common;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Result {
    private String resultCode;
    private String resultDescription;
    private PageDetailDto pageDetail;
}

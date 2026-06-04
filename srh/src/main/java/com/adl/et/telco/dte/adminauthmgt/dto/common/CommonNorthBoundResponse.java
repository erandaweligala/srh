package com.adl.et.telco.dte.adminauthmgt.dto.common;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommonNorthBoundResponse<T> {

    private String code;
    private String message;
    private String description;
    private String traceId;
    private PageDetailDto pageDetail;
    private T data;
}

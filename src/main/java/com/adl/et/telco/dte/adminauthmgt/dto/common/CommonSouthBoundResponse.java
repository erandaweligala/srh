package com.adl.et.telco.dte.adminauthmgt.dto.common;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommonSouthBoundResponse<T> {
    private Result result;
    private T responseData;
}

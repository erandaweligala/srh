package com.adl.et.telco.dte.adminauthmgt.util.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class BaseException extends RuntimeException{

    private final String reason;
    private final HttpStatus httpStatus;
    private final String resultCode;
    private final StackTraceElement[] stackTraceElements;

    public BaseException(String message, String reason, HttpStatus httpStatus, String resultCode, StackTraceElement[] stackTraceElements){
        super(message);
        this.stackTraceElements = stackTraceElements;
        this.httpStatus = httpStatus;
        this.resultCode = resultCode;
        this.reason = reason;
    }
}


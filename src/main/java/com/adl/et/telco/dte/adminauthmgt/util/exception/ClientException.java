package com.adl.et.telco.dte.adminauthmgt.util.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ClientException extends RuntimeException{
    private final String reason;
    private final HttpStatus httpStatus;
    private final String resultCode;
    private final StackTraceElement[] stackTraceElements;
    private final Object data;

    public ClientException(String message, String reason, HttpStatus httpStatus, String resultCode, StackTraceElement[] stackTraceElements, Object data){
        super(message);
        this.stackTraceElements = stackTraceElements;
        this.httpStatus = httpStatus;
        this.resultCode = resultCode;
        this.reason = reason;
        this.data = data;
    }
}


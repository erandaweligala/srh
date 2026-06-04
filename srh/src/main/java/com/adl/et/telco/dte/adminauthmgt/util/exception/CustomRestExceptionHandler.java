package com.adl.et.telco.dte.adminauthmgt.util.exception;



import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;


@ControllerAdvice
public class CustomRestExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger customLogger = LoggerFactory.getLogger(CustomRestExceptionHandler.class);

    @ExceptionHandler(BaseException.class)
    public <T> ResponseEntity<CommonNorthBoundResponse<T>> customerBaseExceptionHandler(BaseException ex) {
        customLogger.error("BaseException exception occurred ", ex);
        CommonNorthBoundResponse<T> commonNorthBoundResponse = new CommonNorthBoundResponse<>();
        commonNorthBoundResponse.setCode(ex.getResultCode());
        commonNorthBoundResponse.setMessage(ex.getMessage());
        commonNorthBoundResponse.setTraceId(MDC.get("Message-Id"));
        return ResponseEntity.status(ex.getHttpStatus()).body(commonNorthBoundResponse);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public <T> ResponseEntity<CommonNorthBoundResponse<T>> customMismatchExceptionHandler(Exception ex) {
        customLogger.error("MethodArgumentTypeMismatchException exception occurred ", ex);
        CommonNorthBoundResponse<T> commonNorthBoundResponse = new CommonNorthBoundResponse<>();
        commonNorthBoundResponse.setCode(DisplayResultCodeEnum.INVALID_INPUT.code());
        commonNorthBoundResponse.setMessage(DisplayResultCodeEnum.INVALID_INPUT.description());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(commonNorthBoundResponse);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public <T> ResponseEntity<CommonNorthBoundResponse<T>> accessDeniedExceptionHandler(Exception ex) {
        customLogger.error("AccessDeniedException exception occurred ", ex);
        CommonNorthBoundResponse<T> commonNorthBoundResponse = new CommonNorthBoundResponse<>();
        commonNorthBoundResponse.setCode(DisplayResultCodeEnum.ACCESS_DENIED.code());
        commonNorthBoundResponse.setMessage(DisplayResultCodeEnum.ACCESS_DENIED.description());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(commonNorthBoundResponse);
    }

    @ExceptionHandler(Exception.class)
    public <T> ResponseEntity<CommonNorthBoundResponse<T>> customExceptionHandler(Exception ex) throws Exception {
        customLogger.error("Generic exception occurred ", ex);
        CommonNorthBoundResponse<T> commonNorthBoundResponse = new CommonNorthBoundResponse<>();
        commonNorthBoundResponse.setCode(DisplayResultCodeEnum.INTERNAL_SERVER_ERROR.code());
        commonNorthBoundResponse.setMessage(DisplayResultCodeEnum.INTERNAL_SERVER_ERROR.description());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(commonNorthBoundResponse);
    }

    @ExceptionHandler(ClientException.class)
    public <T> ResponseEntity<CommonNorthBoundResponse<T>> clientExceptionHandler(ClientException ex) throws Exception {
        customLogger.error("Generic exception occurred ", ex);
        CommonNorthBoundResponse<T> commonNorthBoundResponse = new CommonNorthBoundResponse<>();
        commonNorthBoundResponse.setCode(ex.getResultCode());
        commonNorthBoundResponse.setMessage(ex.getMessage());
        commonNorthBoundResponse.setTraceId(MDC.get("Message-Id"));
        commonNorthBoundResponse.setData((T) ex.getData());
        return ResponseEntity.status(ex.getHttpStatus()).body(commonNorthBoundResponse);
    }
}


package com.adl.et.telco.dte.adminauthmgt.util.exception;

import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;

@Component
public class ExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(ExceptionHandler.class);

    public Result exceptionHandler(HttpStatusCodeException e) throws BaseException {
        try {
            JSONParser parser = new JSONParser();
            String resultCode = (String) ((JSONObject) ((JSONObject) parser.parse(e.getResponseBodyAsString())).get("result")).get("resultCode");
            String resultDescripton = (String) ((JSONObject) ((JSONObject) parser.parse(e.getResponseBodyAsString())).get("result")).get("resultDescription");
            Result result = new Result();
            result.setResultDescription(resultDescripton);
            result.setResultCode(resultCode);
            return result;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.INTERNAL_SERVER_ERROR.description(),
                    HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.INTERNAL_SERVER_ERROR.code(), ex.getStackTrace());
        }
    }

    public BaseException clientExceptionHandler(RuntimeException ex, String reason, String code) {
        logger.error("error occurred while calling external api ", ex);
        HttpStatus httpStatus = HttpStatus.BAD_REQUEST;
        String errorMessage = reason;

        if (ex instanceof HttpStatusCodeException hex) {  // ✅ pattern matching (Java 16+, fine with Spring Boot 3)
            HttpStatusCode statusCode = hex.getStatusCode();
            httpStatus = HttpStatus.resolve(statusCode.value()) != null  // ✅ safely cast HttpStatusCode → HttpStatus
                    ? HttpStatus.resolve(statusCode.value())
                    : HttpStatus.BAD_REQUEST;

            String responseBody = hex.getResponseBodyAsString();
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(responseBody);
                JsonNode resultDescriptionNode = root.path("result").path("resultDescription");
                if (!resultDescriptionNode.isMissingNode()) {
                    errorMessage = resultDescriptionNode.asText();
                }
            } catch (Exception parseEx) {
                logger.error("Failed to parse error response body", parseEx);
            }
        }

        return new BaseException(errorMessage, reason, httpStatus, code, ex.getStackTrace());
    }
}
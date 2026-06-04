package com.adl.et.telco.dte.adminauthmgt.service.impls.common;

import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.common.ExternalAPICallService;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.exception.ClientException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExternalAPICallServiceImpl implements ExternalAPICallService {
    public static final String DEFAULT = "default";
    public static final String CATALOG_ID = "catalogId";

    @Value("${tenant-id}")
    String tenantId;

    private final RestTemplate restTemplate;
    private final HttpServletRequest httpServletRequest;
    private final UserActivityLogInterface userActivityLogInterface;
    private final JwtService jwtService;


    public String externalGetAPICall(String userName, String email, String role, String url, String actionNames, Map<String, String> valueMap, Integer actionId, String type) throws BaseException {
        try {
            String finalUrl = getFinalURL(url, valueMap);
            userActivityLogInterface.logUserActivity(actionNames, MDC.get(AdminAuthConstant.TRACE_ID), (valueMap != null && !valueMap.isEmpty() ? valueMap.toString() : null), finalUrl, jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)), actionId, type);
            HttpEntity<?> requestEntity = getHttpEntityWithHeaders(null,
                    MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON_UTF8, userName, email, role);
            String response = invokeRestApi(finalUrl, HttpMethod.GET, requestEntity);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS, extractDescription(response));
            return response;
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, e.getMessage());
            throw new BaseException(e.getMessage(), e.getMessage(), e.getHttpStatus(), e.getResultCode(), e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ServiceConstants.INTERNAL_ERROR_CODE, ex.getStackTrace());
        }
    }

    public String externalPostAPICall(String userName, String email, String role, String url, String actionNames, Object request, Map<String, String> valueMap, Integer actionId, String type) throws BaseException{
        try {
            HttpEntity<?> requestEntity = getHttpEntityWithHeaders(request, MediaType.APPLICATION_JSON,
                    MediaType.APPLICATION_JSON_UTF8, userName, email, role);
            String finalUrl = getFinalURL(url, valueMap);
            userActivityLogInterface.logUserActivity(actionNames, MDC.get(AdminAuthConstant.TRACE_ID), request.toString(), finalUrl, jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)), actionId, type);
            String response = invokeRestApi(finalUrl, HttpMethod.POST, requestEntity);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS, extractDescription(response));
            return response;
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, e.getMessage());
            throw new BaseException(e.getMessage(), e.getMessage(), e.getHttpStatus(), e.getResultCode(), e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ServiceConstants.INTERNAL_ERROR_CODE, ex.getStackTrace());
        }

    }

    public String externalPutAPICall(String userName, String email, String role, String url, String actionNames, Object request, Map<String, String> valueMap, Integer actionId, String type) throws BaseException {
        try {
            HttpEntity<?> requestEntity = getHttpEntityWithHeaders(request, MediaType.APPLICATION_JSON,
                    MediaType.APPLICATION_JSON_UTF8, userName, email, role);
            String finalUrl = getFinalURL(url, valueMap);
            userActivityLogInterface.logUserActivity(actionNames, MDC.get(AdminAuthConstant.TRACE_ID), request.toString(), finalUrl, jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)), actionId, type);
            String response = invokeRestApi(finalUrl, HttpMethod.PUT, requestEntity);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS, extractDescription(response));
            return response;
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, e.getMessage());
            throw new BaseException(e.getMessage(), e.getMessage(), e.getHttpStatus(), e.getResultCode(), e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ServiceConstants.INTERNAL_ERROR_CODE, ex.getStackTrace());
        }

    }

    public String externalPatchAPICall(String userName, String email, String role, String url, String actionNames, Object request, Map<String, String> valueMap, Integer actionId, String type) throws BaseException {
        try {
            HttpEntity<?> requestEntity = getHttpEntityWithHeaders(request, MediaType.APPLICATION_JSON,
                    MediaType.APPLICATION_JSON_UTF8, userName, email, role);
            String finalUrl = getFinalURL(url, valueMap);
            userActivityLogInterface.logUserActivity(actionNames, MDC.get(AdminAuthConstant.TRACE_ID), request != null ? request.toString() : "", finalUrl, jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)), actionId, type);
            String response = invokeRestApi(finalUrl, HttpMethod.PATCH, requestEntity);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS, extractDescription(response));
            return response;
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, e.getMessage());
            throw new BaseException(e.getMessage(), e.getMessage(), e.getHttpStatus(), e.getResultCode(), e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ServiceConstants.INTERNAL_ERROR_CODE, ex.getStackTrace());
        }

    }

    public String externalDeleteAPICall(String userName, String email, String role, String url, String actionNames, Object request, Map<String, String> valueMap, Integer actionId, String type) throws BaseException {
        try {
            HttpEntity<?> requestEntity = getHttpEntityWithHeaders(request,
                    MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON_UTF8, userName, email, role);
            String finalUrl = getFinalURL(url, valueMap);
            userActivityLogInterface.logUserActivity(actionNames, MDC.get(AdminAuthConstant.TRACE_ID), request != null ? request.toString() : "", finalUrl, jwtService.extractUsername(jwtService.tokenExtractor(httpServletRequest)), actionId, type);
            String response = invokeRestApi(finalUrl, HttpMethod.DELETE, requestEntity);
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.SUCCESS, extractDescription(response));
            return response;
        } catch (BaseException e) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, e.getMessage());
            throw new BaseException(e.getMessage(), e.getMessage(), e.getHttpStatus(), e.getResultCode(), e.getStackTrace());
        } catch (Exception ex) {
            userActivityLogInterface.updateStatus(MDC.get(AdminAuthConstant.TRACE_ID), ServiceConstants.FAILED_CAPITAL, ex.getMessage());
            throw new BaseException(ex.getMessage(), ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, ServiceConstants.INTERNAL_ERROR_CODE, ex.getStackTrace());
        }

    }

    public InputStream externalGetFileAsAStream(String url, Map<String, String> valueMap) throws IOException {
        String finalUrl = getFinalURL(url, valueMap);
        URL myUrl = new URL(finalUrl);
        URLConnection connection = myUrl.openConnection();
        connection.setConnectTimeout(10 * 1000);
        connection.setReadTimeout(10 * 1000);
        log.info("report downloading started");
        InputStream data = connection.getInputStream();
        log.info("report downloading finished");
        return data;
    }

    public InputStream externalGetFileAsAStreamForPostEndPoint(String url, Object request, Map<String, String> valueMap)
            throws IOException {

        String finalUrl = getFinalURL(url, valueMap);
        URL myUrl = new URL(finalUrl);
        HttpURLConnection connection = (HttpURLConnection) myUrl.openConnection();
        connection.setConnectTimeout(6 * 1000);
        connection.setReadTimeout(6 * 1000);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json; utf-8");
        connection.setDoOutput(true);
        ObjectMapper mapper = new ObjectMapper();
        String requestAsString = mapper.writeValueAsString(request);
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = requestAsString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        return connection.getInputStream();
    }

    @Override
    public InputStream externalGetFileAsAStreamForGetEndPoint(String url, Object request, Map<String, String> valueMap)
            throws IOException {

        String finalUrl = getFinalURL(url, valueMap);
        URL myUrl = new URL(finalUrl);
        HttpURLConnection connection = (HttpURLConnection) myUrl.openConnection();
        connection.setConnectTimeout(6 * 1000);
        connection.setReadTimeout(6 * 1000);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-Type", "application/json; utf-8");
        connection.setDoOutput(true);
        ObjectMapper mapper = new ObjectMapper();
        String requestAsString = mapper.writeValueAsString(request);
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = requestAsString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        return connection.getInputStream();
    }

    private String getFinalURL(String url, Map<String, String> valueMap) {
        log.debug("Url building started");
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
        if (Objects.nonNull(valueMap) && !valueMap.isEmpty()) {
            for (Map.Entry<String, String> entry : valueMap.entrySet()) {
                builder.queryParam(entry.getKey(), entry.getValue());
            }
        }
        String finalUrl = builder.build(false).toUriString();
        log.debug("Invoking api with final url ==> {}", finalUrl);
        return finalUrl;
    }


    private String invokeRestApi(String url,
                                 HttpMethod method,
                                 HttpEntity<?> requestEntity)
            throws BaseException {

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(url, method, requestEntity, String.class);

            String responseBody = response.getBody();
            log.info("response : {}", responseBody);
            return responseBody;

        } catch (HttpStatusCodeException e) {

            HttpStatus status = HttpStatus.resolve(e.getStatusCode().value()) != null
                    ? HttpStatus.resolve(e.getStatusCode().value())
                    : HttpStatus.INTERNAL_SERVER_ERROR;
            String responseBody = e.getResponseBodyAsString();
            log.error("Error response from downstream service: {}", responseBody);

            String errorMessage = "Downstream service error";
            String code = null;
            Object data = null;

            if (!responseBody.isBlank()) {
                try {
                    JSONParser parser = new JSONParser();
                    JSONObject json = (JSONObject) parser.parse(responseBody);


                    if (json.containsKey("message")) {
                        errorMessage = (String) json.get("message");
                    } else if (json.containsKey("description")) {
                        errorMessage = (String) json.get("description");
                    }
                    else if (json.containsKey("result")) {
                        JSONObject result = (JSONObject) json.get("result");
                        if (result != null) {
                            if (result.containsKey("resultDescription")) {
                                errorMessage = (String) result.get("resultDescription");
                            }
                            if (result.containsKey("resultCode")) {
                                code = (String) result.get("resultCode");
                            }
                        }
                    }

                    if (code == null) {
                        if (json.containsKey("error_code")) {
                            code = (String) json.get("error_code");
                        } else if (json.containsKey("responseCode")) {
                            code = (String) json.get("responseCode");
                        } else {
                            code = String.valueOf(status.value());
                        }
                    }

                } catch (Exception parseEx) {
                    log.error("Error parsing downstream error response", parseEx);
                    errorMessage = responseBody; // fallback
                }
            }

            throw new BaseException(
                    errorMessage,
                    errorMessage,
                    status,
                    code,
                    e.getStackTrace()
            );
        }
    }

    private String extractDescription(String response) throws ParseException {
        String message = ServiceConstants.SUCCESS_DESCRIPTION;
        try{
            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject) parser.parse(response);


            if (json.containsKey("message")) {
                message = (String) json.get("message");
            }
        } catch (Exception e) {
            log.error("Error parsing downstream response", e);
        }
        return message;
    }


    private HttpEntity<?> getHttpEntityWithHeaders(Object request, MediaType contentType, MediaType acceptType, String userName, String email, String role) {
        HttpHeaders headers = new HttpHeaders();
        String catalogId = httpServletRequest.getHeader(CATALOG_ID);
        if (DEFAULT.equalsIgnoreCase(catalogId)){
            headers.add(CATALOG_ID, null);
        }else{
            headers.add(CATALOG_ID, catalogId);
        }
        if (Objects.nonNull(contentType)) {
            headers.setContentType(contentType);
        }
        if (Objects.nonNull(contentType)) {
            List<MediaType> accepted = new ArrayList<>();
            accepted.add(acceptType);
            headers.setAccept(accepted);
        }
        headers.add(Constants.HEADER_USER_ID, userName);
        headers.add(Constants.HEADER_USER, email);
        headers.add(Constants.HEADER_ROLE, role);
        headers.add(Constants.TENANT_ID, tenantId);
        headers.add(Constants.CHANNEL,"SRH");

        return new HttpEntity<>(request, headers);
    }

    @Override
    public String externalPostUploadAPICall(String userName, String url, MultipartFile multipartFile, Map<String, String> valueMap) throws IOException, BaseException, ParseException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        String catalogId = httpServletRequest.getHeader(CATALOG_ID);
        if (DEFAULT.equalsIgnoreCase(catalogId)){
            headers.add(CATALOG_ID, null);
        }else{
            headers.add(CATALOG_ID, catalogId);
        }
        log.info("catalogId={}", httpServletRequest.getHeader("catalogId"));
        headers.add("userName", userName);
        String finalUrl = getFinalURL(url, valueMap);
        MultiValueMap<String, String> fileMap = new LinkedMultiValueMap<>();

        log.info("Get original file name {}", multipartFile.getOriginalFilename());

        log.info("Received original file name {}", valueMap.get("requestHeader.fileName"));
        ContentDisposition contentDisposition = ContentDisposition
                .builder("form-data")
                .name("file")
                .filename(Objects.requireNonNull(multipartFile.getOriginalFilename()))
                .build();

        fileMap.add(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString());
        HttpEntity<byte[]> fileEntity = new HttpEntity<>(multipartFile.getBytes(), fileMap);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        String responseAsString = "";
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(finalUrl, requestEntity, String.class);
            log.info("Response status from file uploading {} ", response.getStatusCode().value());
            responseAsString = response.getBody();
            log.info("Response from file uploading {} ", responseAsString);
        } catch (HttpStatusCodeException e) {
            HttpStatus status = HttpStatus.resolve(e.getStatusCode().value()) != null
                    ? HttpStatus.resolve(e.getStatusCode().value())
                    : HttpStatus.INTERNAL_SERVER_ERROR;
            if (HttpStatus.BAD_REQUEST.equals(status) || HttpStatus.NOT_FOUND.equals(status)) {
                responseAsString = e.getResponseBodyAsString();
                String responseDesc = "";
                JSONParser jsonParser = new JSONParser();
                Object data = "";
                if (!responseAsString.isEmpty()) {
                    JSONObject responseAsJson = (JSONObject) jsonParser.parse(responseAsString);
                    log.info("received response {}", responseAsJson.toString());
                    JSONObject responseHeaderVal = (JSONObject) responseAsJson.get("responseHeader");
                    if (Objects.nonNull(responseHeaderVal)) {
                        responseDesc = (String) responseHeaderVal.get("responseDescription");
                        data = responseHeaderVal.get("data");
                    } else {
                        responseDesc = (String) responseAsJson.get("responseDescription");
                        data = responseAsJson.get("data");
                    }
                }
                throw new ClientException(responseDesc, responseDesc, status, "400", e.getStackTrace(), data);
            }
        }
        return responseAsString;
    }
}
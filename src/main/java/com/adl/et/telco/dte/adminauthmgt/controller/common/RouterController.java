package com.adl.et.telco.dte.adminauthmgt.controller.common;

import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.common.ExternalAPICallService;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("${base-url.context}")
@CrossOrigin(origins = "*")
public class RouterController extends BaseController {

    private final ExternalAPICallService externalAPICallService;
    private final ObjectMapper objectMapper;

    @Autowired
    public RouterController(ExternalAPICallService externalAPICallService, ObjectMapper objectMapper) {
        this.externalAPICallService = externalAPICallService;
        this.objectMapper = objectMapper;
    }

    /**
     * Intercept all the POST requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     * @throws IOException IOException
     */
    @Operation(summary = "For forwarding all post api calls start with /api to external micro services")
    @PostMapping(value = "/api/**")
    public ResponseEntity<String> forwardPostRequest(HttpServletRequest request,
                                                     @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        log.info("POST request received with content {} containing parameters {}", requestContent, requestParams);

        String response = externalAPICallService.externalPostAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.EMAIL),
                map.get(AdminAuthConstant.ROLE),
                map.get(AdminAuthConstant.MSURL),
                map.get(AdminAuthConstant.ACTIONS),
                requestContent,
                requestParams,
                Integer.parseInt(map.get(AdminAuthConstant.ACTION_ID)),
                map.get(AdminAuthConstant.TYPE)
        );

//        saveAuditInformation(map);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Intercept all the GET requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     */
    @GetMapping(value = "/api/**", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> forwardGetRequest(HttpServletRequest request,
                                                    @RequestParam(required = false) Map<String, String> requestParams)
            throws ParseException {

        Map<String, String> map = performCommonAction(request);
        log.info("GET request received containing parameters {}", requestParams);

        String response = externalAPICallService.externalGetAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.EMAIL),
                map.get(AdminAuthConstant.ROLE),
                map.get(AdminAuthConstant.MSURL),
                map.get(AdminAuthConstant.ACTIONS),
                requestParams,
                Integer.parseInt(map.get(AdminAuthConstant.ACTION_ID)),
                map.get(AdminAuthConstant.TYPE)
        );

//        saveAuditInformation(map);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Type", "application/json");

        return ResponseEntity.ok()
                .headers(responseHeaders)
                .body(response);
    }

    /**
     * Intercept all the PUT requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     * @throws IOException IOException
     */
    @PutMapping(value = "/api/**")
    public ResponseEntity<String> forwardPutRequest(HttpServletRequest request,
                                                    @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        log.info("PUT request received with content {} containing parameters {}", requestContent, requestParams);

        String response = externalAPICallService.externalPutAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.EMAIL),
                map.get(AdminAuthConstant.ROLE),
                map.get(AdminAuthConstant.MSURL),
                map.get(AdminAuthConstant.ACTIONS),
                requestContent,
                requestParams,
                Integer.parseInt(map.get(AdminAuthConstant.ACTION_ID)),
                map.get(AdminAuthConstant.TYPE)
        );

//        saveAuditInformation(map);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Intercept all the PUT requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     * @throws IOException IOException
     */
    @PatchMapping(value = "/api/**")
    public ResponseEntity<String> forwardPatchRequest(HttpServletRequest request,
                                                      @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        log.info("PATCH request received with content {} containing parameters {}", requestContent, requestParams);

        String response = externalAPICallService.externalPatchAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.EMAIL),
                map.get(AdminAuthConstant.ROLE),
                map.get(AdminAuthConstant.MSURL),
                map.get(AdminAuthConstant.ACTIONS),
                requestContent,
                requestParams,
                Integer.parseInt(map.get(AdminAuthConstant.ACTION_ID)),
                map.get(AdminAuthConstant.TYPE)
        );

//        saveAuditInformation(map);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Intercept all the DELETE requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     * @throws IOException IOException
     */
    @DeleteMapping(value = "/api/**")
    public ResponseEntity<String> forwardDeleteRequest(HttpServletRequest request,
                                                       @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        log.debug("DELETE request received with content {} containing parameters {}", requestContent, requestParams);

        String response = externalAPICallService.externalDeleteAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.EMAIL),
                map.get(AdminAuthConstant.ROLE),
                map.get(AdminAuthConstant.MSURL),
                map.get(AdminAuthConstant.ACTIONS),
                requestContent,
                requestParams,
                Integer.parseInt(map.get(AdminAuthConstant.ACTION_ID)),
                map.get(AdminAuthConstant.TYPE)
        );

//        saveAuditInformation(map);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Intercept all the POST requests that starts with /api
     *
     * @param request       http request
     * @param requestParams request parameters ,can be null or empty. if found will be forwarded into the micro service
     * @return response String from the service
     * @throws IOException IOException
     */
    @GetMapping(value = "/api/reporting/**")
    public ResponseEntity<InputStreamResource> forwardGetReportingRequest(HttpServletRequest request,
                                                                          @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        log.debug("GET request received for getting reports with param {}", requestParams);

        InputStream inputStreamResource = externalAPICallService.externalGetFileAsAStream(
                map.get(AdminAuthConstant.MSURL),
                requestParams
        );

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Template.xlsx");
        headers.setContentType(MediaType.TEXT_PLAIN);

        InputStreamResource inputStreamResource1 = new InputStreamResource(inputStreamResource);

//        saveAuditInformation(map);
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(inputStreamResource1);
    }

    @GetMapping(value = "/api/file-download/**")
    public ResponseEntity<InputStreamResource> forwardGetFileDownloadRequest(HttpServletRequest request,
                                                                             @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        InputStream inputStreamResource = externalAPICallService.externalGetFileAsAStreamForGetEndPoint(
                map.get(AdminAuthConstant.MSURL),
                requestContent,
                requestParams
        );

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Template.xlsx");
        headers.setContentType(MediaType.TEXT_PLAIN);

        InputStreamResource inputStreamResource1 = new InputStreamResource(inputStreamResource);

//        saveAuditInformation(map);
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(inputStreamResource1);
    }

    @PostMapping(value = "/api/file-download/**")
    public ResponseEntity<InputStreamResource> forwardFileDownLoadRequest(HttpServletRequest request,
                                                                          @RequestParam(required = false) Map<String, String> requestParams)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        Object requestContent = readRequestBody(request);

        InputStream inputStreamResource = externalAPICallService.externalGetFileAsAStreamForPostEndPoint(
                map.get(AdminAuthConstant.MSURL),
                requestContent,
                requestParams
        );

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Template.xlsx");
        headers.setContentType(MediaType.TEXT_PLAIN);

        InputStreamResource inputStreamResource1 = new InputStreamResource(inputStreamResource);

//        saveAuditInformation(map);
        return ResponseEntity
                .ok()
                .headers(headers)
                .body(inputStreamResource1);
    }

    @PostMapping(value = "/api/upload-doc/**")
    public ResponseEntity<String> forwardPostUploadRequest(HttpServletRequest request,
                                                           @RequestParam(required = false) Map<String, String> requestParams,
                                                           @RequestParam("file") MultipartFile file)
            throws IOException, ParseException {

        Map<String, String> map = performCommonAction(request);
        log.debug("Upload request received");

        String response = externalAPICallService.externalPostUploadAPICall(
                map.get(AdminAuthConstant.USERNAME),
                map.get(AdminAuthConstant.MSURL),
                file,
                requestParams
        );

//        saveAuditInformation(map);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Read request body safely without using ServletInputStream.available().
     * Returns null when request body is empty.
     */
    private Object readRequestBody(HttpServletRequest request) throws IOException {
        String body = request.getReader()
                .lines()
                .collect(Collectors.joining(System.lineSeparator()));

        if (body.isBlank()) {
            return null;
        }

        return objectMapper.readValue(body, Object.class);
    }
}
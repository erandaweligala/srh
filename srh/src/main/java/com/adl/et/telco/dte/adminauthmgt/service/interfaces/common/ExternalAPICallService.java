package com.adl.et.telco.dte.adminauthmgt.service.interfaces.common;


import org.json.simple.parser.ParseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public interface ExternalAPICallService {

    String externalGetAPICall(String userName,String email,String role,String url, String actionNames, Map<String, String> requestParam, Integer actionId, String type) throws  ParseException;

    InputStream externalGetFileAsAStream(String url, Map<String, String> requestParam) throws IOException;

    String externalPostAPICall(String userName,String email,String role,String url, String actionNames, Object request,Map<String, String> requestParam, Integer actionId, String type) throws  ParseException;

    String externalPutAPICall(String userName,String email,String role,String url, String actionNames, Object request,Map<String, String> valueMap, Integer actionId, String type) throws  ParseException;

    String externalPatchAPICall(String userName,String email,String role,String url, String actionNames, Object request,Map<String, String> valueMap, Integer actionId, String type) throws  ParseException;

    String externalDeleteAPICall(String userName,String email,String role,String url, String actionNames, Object request,Map<String, String> valueMap, Integer actionId, String type) throws  ParseException;

    String externalPostUploadAPICall(String userName, String url, MultipartFile multipartFile, Map<String, String> valueMap) throws IOException,  ParseException;

    InputStream externalGetFileAsAStreamForPostEndPoint(String url,Object request, Map<String, String> valueMap) throws IOException;

    InputStream externalGetFileAsAStreamForGetEndPoint(String url,Object request, Map<String, String> valueMap) throws IOException;

}


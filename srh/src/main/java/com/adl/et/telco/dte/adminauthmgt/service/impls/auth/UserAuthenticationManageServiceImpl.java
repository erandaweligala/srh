package com.adl.et.telco.dte.adminauthmgt.service.impls.auth;


import com.adl.et.telco.dte.adminauthmgt.dto.authentication.SamlRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.UserAuthenticationManageService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.text.StrSubstitutor;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.zip.Deflater;
import java.util.zip.DeflaterOutputStream;

;

@Service
@Slf4j
public class UserAuthenticationManageServiceImpl implements UserAuthenticationManageService {

//    private static final Logger log = LoggerFactory.getLogger(UserAuthenticationManageServiceImpl.class);

    @Autowired
    private ResponseHandler handler;

    @Value("${saml.request.requestId.cache.time.sec}")
    private long expiryTime;

    @Value("${azure.ad.tenant-id}")
    private String azureTenantId;

    @Value("${saml.request.issuer.url}")
    private String issuerUrl;

    @Value("${saml.request.redirection.url}")
    private String redirectionUrl;

    /**
     * This is the method for generating SAML request and redirection url
     *
     * @param uuid
     * @return
     * @throws BaseException
     */

    public CommonNorthBoundResponse<SamlRequest> createSamlRequest(String uuid) throws BaseException {

        try {
            SamlRequest samlRequest = new SamlRequest();
            String requestId = UUID.randomUUID().toString();
            DateTime issueInstant = new DateTime();
            String uriEncode = generateSamlRequest(requestId, issueInstant);
            samlRequest.setUrl(getRedirectionUrl(uriEncode));
            return handler.responseBuilder(samlRequest, AuthCodeEnum.AUTH_REQUEST_SUCCESS.description(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.code());
        } catch (BaseException ex) {
            throw new BaseException(ex.getMessage(), ex.getReason(), ex.getHttpStatus(), ex.getResultCode(), ex.getStackTraceElements());
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.description(), HttpStatus.INTERNAL_SERVER_ERROR, AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.code(), ex.getStackTrace());
        }
    }


    /**
     * generate redirection url by substituting SAML request and application id
     *
     * @param uriEncode
     * @return
     */
    private String getRedirectionUrl(String uriEncode) {
        log.debug("getRedirectionUrl method started");
        Map<String, String> urlParams = new HashMap<>();
        urlParams.put("tenantId", azureTenantId);
        urlParams.put("uriEncode", uriEncode);
        log.debug("getRedirectionUrl method finished");
        return UriComponentsBuilder.fromUriString(redirectionUrl).buildAndExpand(urlParams).toString();

    }

    /**
     * generate SAMl request
     *
     * @param requestId
     * @param issueInstant
     * @return
     * @throws UnsupportedEncodingException
     */
    private String generateSamlRequest(String requestId, DateTime issueInstant) throws IOException {
        log.debug("generateSamlRequest method started");
        Map<String, String> values = new HashMap<>();
        values.put("requestId", requestId);
        values.put("issueInstant", issueInstant.toString());
        values.put("issuerUrl", issuerUrl);
        String requestTemplate = StrSubstitutor.replace(new StringBuilder().append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<samlp:AuthnRequest xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" xmlns=\"urn:oasis:names:tc:SAML:2.0:metadata\" ID=\"id${requestId}\" Version=\"2.0\" IssueInstant=\"${issueInstant}\">\n" +
                "<Issuer xmlns=\"urn:oasis:names:tc:SAML:2.0:assertion\">${issuerUrl}</Issuer>\n" +
                "</samlp:AuthnRequest>").toString(), values, "${", "}");

        Deflater deflater = new Deflater(Deflater.DEFLATED, true);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        DeflaterOutputStream deflaterOutputStream = new DeflaterOutputStream(byteArrayOutputStream, deflater);
        deflaterOutputStream.write(requestTemplate.getBytes());
        deflaterOutputStream.close();

        String encodedBytes = Base64.encodeBase64String(byteArrayOutputStream.toByteArray());
        log.debug("generateSamlRequest method finished");
        return URLEncoder.encode(encodedBytes, StandardCharsets.UTF_8.toString());

    }

}


package com.adl.et.telco.dte.adminauthmgt.controller.auth;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.AccessTokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.SamlRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth.UserAuthenticationManageService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.CookieService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.SamlResponseService;
import com.adl.et.telco.dte.adminauthmgt.util.access.AuthLoggingConstants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@RestController
public class ADAuthenticationController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(ADAuthenticationController.class);
    @Value("${login.success.url}")
    private String adLoginSuccessURL;

    @Value("${login.fail.url}")
    private String adLoginFailUrl;


    @Autowired
    private UserAuthenticationManageService userAuthenticationManageService;

    @Autowired
    private SamlResponseService samlResponseService;

    @Autowired
    private CookieService cookieService;

    /**
     * Get SAML2 request
     *
     * @param httpServletRequest
     * @return
     * @throws BaseException
     */

    @GetMapping({"/srh/auth/azure-ad-auth/saml2-request"})
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<CommonNorthBoundResponse<SamlRequest>> createSamlRequest(HttpServletRequest httpServletRequest) throws IOException, BaseException {
        UUID uuid = UUID.randomUUID();
        CommonNorthBoundResponse<SamlRequest> samlRequest = userAuthenticationManageService.createSamlRequest(uuid.toString());
        return setResponseEntity(samlRequest);
    }

    /**
     * Validate SAML token and redirect with temp token and rv-token
     *
     * @param saml
     * @return
     * @throws BaseException
     */
    @PostMapping({"/srh/auth/azure-ad-auth/saml-res","/auth/azure-ad-auth/saml-res"})
    public ResponseEntity<AccessTokenResponse> validateSAMLTokenAndRedirect(@RequestParam("SAMLResponse") String saml, HttpServletResponse response,
                                                                            HttpServletRequest httpServletRequest) {
        CommonNorthBoundResponse<TokenResponse> validatedSamlResponse = samlResponseService.createTempToken(saml);

        if (validatedSamlResponse.getCode().equals(AuthCodeEnum.LOGIN_SUCCESS.code())) {
            response.addCookie(cookieService.createCookie(validatedSamlResponse.getData().getRequestVerificationToken()));
            return ResponseEntity.status(302).location(URI.create(adLoginSuccessURL + validatedSamlResponse.getData().getTempToken())).build();
        } else if (validatedSamlResponse.getCode().equals(AuthCodeEnum.USER_NOT_FOUND.code())) {
            logger.error(AuthLoggingConstants.LOGGING_FAILED,validatedSamlResponse.getDescription());
            return ResponseEntity.status(302).location(URI.create(adLoginFailUrl + Constants.USER_NOT_FOUN_PATH)).build();
        } else if (validatedSamlResponse.getCode().equals(AuthCodeEnum.INACTIVE_USER.code())) {
            logger.error(AuthLoggingConstants.LOGGING_FAILED,validatedSamlResponse.getDescription());
            return ResponseEntity.status(302).location(URI.create(adLoginFailUrl+ Constants.INACTIVE_USER_PATH)).build();
        } else {
            logger.error(AuthLoggingConstants.LOGGING_FAILED,validatedSamlResponse.getDescription());
            return ResponseEntity.status(302).location(URI.create(adLoginFailUrl + Constants.INTERNAL_ERROR_PATH)).build();
        }
    }


}

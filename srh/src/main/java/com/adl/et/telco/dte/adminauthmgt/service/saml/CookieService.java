package com.adl.et.telco.dte.adminauthmgt.service.saml;

import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;



@Service
public class CookieService {

    // The rv_token is issued as a session cookie (no Max-Age / Expires). The browser keeps it only
    // for the lifetime of the browser session and discards it on close, so when the user reopens the
    // browser the cookie is gone, the JwtRequestFilter rejects the request, and the UI sends the user
    // back to the login page - forcing a fresh login as required.
    private static final int SESSION_COOKIE_MAX_AGE = -1;

    public Cookie createCookie(String value) throws BaseException {
        try {
            // create a cookie
            Cookie cookie = new Cookie(ServiceConstants.RV_TOKEN, value);
            cookie.setMaxAge(SESSION_COOKIE_MAX_AGE);
            // optional properties
//            cookie.setSecure(true);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            return cookie;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }
}


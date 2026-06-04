package com.adl.et.telco.dte.adminauthmgt.controller;


import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.common.MicroServiceURLFetchService;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class BaseController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MicroServiceURLFetchService microServiceURLFetchService;

    protected List<SimpleGrantedAuthority> getUserInfo(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ((List) authentication.getAuthorities());
    }


    protected Map<String, String> performCommonAction(HttpServletRequest request) {
        Map<String, String> requestDetailMap = new HashMap<>();
        String uri = request.getRequestURI();
        log.info("requested resource uri  ==> {}", uri);

        List<SimpleGrantedAuthority> grantedAuthorities = getUserInfo(request);

        String token = jwtService.tokenExtractor(request);
        String role = jwtService.extractClaimWithType(token, "role", String.class);
        String email = jwtService.extractClaimWithType(token, "email", String.class);
        String userName = jwtService.extractUsername(token);
        List<Long> actions = jwtService.extractActions(token);

        log.info("performing operation by user {} with role {}", userName, role);
        Map<String, String> msDataMap = microServiceURLFetchService.checkAndReturnURL(uri, actions);
        log.info("mapped microservice url ==> {}", msDataMap.get(AdminAuthConstant.MSURL));
        requestDetailMap.put(AdminAuthConstant.URI, uri);
        requestDetailMap.put(AdminAuthConstant.ROLE, role);
        requestDetailMap.put(AdminAuthConstant.EMAIL, email);
        requestDetailMap.put(AdminAuthConstant.USERNAME, userName);
        requestDetailMap.put(AdminAuthConstant.MSURL, msDataMap.get(AdminAuthConstant.MSURL));
        requestDetailMap.put(AdminAuthConstant.ACTIONS, msDataMap.get(AdminAuthConstant.ACTIONS));
        requestDetailMap.put(AdminAuthConstant.ACTION_ID,msDataMap.get(AdminAuthConstant.ACTION_ID));
        requestDetailMap.put(AdminAuthConstant.TYPE,msDataMap.get(AdminAuthConstant.TYPE));
        return requestDetailMap;
    }

    public <T> ResponseEntity<CommonNorthBoundResponse<T>> setResponseEntity(CommonNorthBoundResponse<T> commonNorthBoundResponse) {
        return ResponseEntity.status(HttpStatus.OK).body(commonNorthBoundResponse);
    }

}

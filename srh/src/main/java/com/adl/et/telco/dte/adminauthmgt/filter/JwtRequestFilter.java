package com.adl.et.telco.dte.adminauthmgt.filter;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.access.AuthLoggingConstants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

@Component
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private JwtService jwtService;
    @Autowired
    ResponseHandler responseHandler;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {                           // ✅ ServletException must be declared
        initialData(request);
        try {
            String jwtToken = null;

            final String authorizationHeader = request.getHeader(ServiceConstants.AUTHORIZATION);
            if (authorizationHeader != null && authorizationHeader.startsWith(ServiceConstants.BEARER)) {
                jwtToken = authorizationHeader.substring(7);
            }
            if (jwtToken != null) {
                jwtTokenValidation(jwtToken, request);
            }
            if (jwtToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtService.isValidToken(jwtToken)) {
                    logger.info("jwt token valid");
                    String userName = jwtService.extractUsername(jwtToken);
                    logger.info("Authorities: {}", jwtService.extractAuthorities(jwtToken));
                    UserDetails userDetails = new User(userName, "", jwtService.extractAuthorities(jwtToken));
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    logger.info("Is authenticated: {}", usernamePasswordAuthenticationToken.isAuthenticated());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    logger.info("SecurityContext: {}", SecurityContextHolder.getContext().getAuthentication());
                } else {
                    logger.error("invalid token");
                    throw new BaseException(AuthCodeEnum.INVALID_TOKEN.description(), AuthCodeEnum.INVALID_TOKEN.description(),
                            HttpStatus.FORBIDDEN, AuthCodeEnum.INVALID_TOKEN.code(), null);
                }
            }
            chain.doFilter(request, response);
        } catch (BaseException ex) {
            logger.error("catch base exception : {}", ex.getHttpStatus().value());
            writeErrorResponse(response, ex.getHttpStatus().value(),
                    responseHandler.northBoundRespHandler(ex.getResultCode(), ex.getReason()));
        } catch (ExpiredJwtException ex) {
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED.value(),
                    responseHandler.northBoundRespHandler(AuthCodeEnum.ACCESS_TOKEN_EXPIRED.code(), ex.getMessage()));
        } catch (Exception ex) {
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED.value(),
                    responseHandler.northBoundRespHandler(AuthCodeEnum.INTERNAL_SERVER_ERROR.code(),
                            AuthCodeEnum.INTERNAL_SERVER_ERROR.description()));
        }
    }

    private void writeErrorResponse(HttpServletResponse response, int status,
                                    CommonNorthBoundResponse<String> body) throws IOException {
        response.setStatus(status);
        response.setHeader(ServiceConstants.CONTENT_TYPE, ServiceConstants.APPLICATION_JSON);
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
    }

    private void jwtTokenValidation(String jwtToken, HttpServletRequest request) throws BaseException {
        String userId = jwtService.extractUsername(jwtToken);
        logger.info("AUTH|user Id: {}", userId);

        if (jwtService.isTokenExpired(jwtToken)) {
            logger.error("Token expired");
            throw new BaseException(AuthCodeEnum.ACCESS_TOKEN_EXPIRED.description(), AuthCodeEnum.ACCESS_TOKEN_EXPIRED.description(),
                    HttpStatus.UNAUTHORIZED, AuthCodeEnum.ACCESS_TOKEN_EXPIRED.code(), null);
        }

        Cookie requestVerificationCookie = request.getCookies() != null
                ? Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(ServiceConstants.RV_TOKEN))
                .findAny().orElse(null)
                : null;


        if (requestVerificationCookie == null) {
            logger.error("RV Token is null");
            throw new BaseException(AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.description(), AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.description(),
                    HttpStatus.FORBIDDEN, AuthCodeEnum.RV_TOKEN_MUST_NOT_BE_NULL.code(), null);
        }

        // Enforce session ownership: the rv_token cookie must match the one currently stored for this
        // user. When the user logs in again elsewhere, the stored token is rotated, so this (older)
        // session's cookie no longer matches and is rejected here - automatically logging it out.
        if (!jwtService.isValidRequestVerificationTokenUsingAccessToken(jwtToken, requestVerificationCookie.getValue())) {
            logger.error("Invalid RV Token");
            throw new BaseException(AuthCodeEnum.INVALID_RV_TOKEN.description(), AuthCodeEnum.INVALID_RV_TOKEN.description(),
                    HttpStatus.UNAUTHORIZED, AuthCodeEnum.INVALID_RV_TOKEN.code(), null);
        }
    }

    private void initialData(HttpServletRequest request) {
        MDC.remove(ServiceConstants.SUBJECT_VALUE);
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp != null) {
            MDC.put("Client-IP", clientIp);
        }
        MDC.put("Message-ID", UUID.randomUUID().toString());

        String cacheId = request.getHeader("cache-id");
        if (cacheId != null) {
            MDC.put("Cache-Id", cacheId);
        }

        if (!request.getRequestURI().equalsIgnoreCase("/actuator/health")) {
            log.info(AuthLoggingConstants.REQUEST_RECEIVED, request.getMethod(), request.getRequestURI());
        }
    }
}
package com.adl.et.telco.dte.adminauthmgt.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Order(1)
public class SecurityHeadersFilter implements Filter {

    private final List<String> allowedOrigins;

    public SecurityHeadersFilter(@Value("${cors.allowed-origins:}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // VAPT FIX: Validate Origin/Referer
        if (!isValidRequestSource(httpRequest)) {
            httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write(
                    "{\"code\":\"4003\",\"message\":\"Forbidden\",\"description\":\"Invalid request origin\"}"
            );
            return;
        }

        // Security headers
        httpResponse.setHeader("Content-Security-Policy",
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data:; font-src 'self'; frame-ancestors 'none'");
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        chain.doFilter(request, httpResponse);
    }

    private boolean isValidRequestSource(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip validation for public endpoints
        if (path.contains("/internal/monitor") ||
                path.contains("/auth/azure-ad-auth/saml-res") ||
                path.contains("/srh/auth/azure-ad-auth/saml2-request") ||
                path.contains("/srh/auth/user/login") ||
                path.contains("/srh/credential-auth")) {
            return true;
        }

        // Check Origin header first
        String origin = request.getHeader("Origin");
        if (origin != null) {
            return allowedOrigins.stream()
                    .anyMatch(allowed -> origin.equalsIgnoreCase(allowed));
        }

        // Check Referer header as fallback
        String referer = request.getHeader("Referer");
        if (referer != null) {
            return allowedOrigins.stream()
                    .anyMatch(allowed -> referer.toLowerCase().startsWith(allowed.toLowerCase()));
        }

        // No Origin or Referer — check if it's a browser request
        // Browsers always send Sec-Fetch-Site, non-browser clients (Postman/curl) don't
        String secFetchSite = request.getHeader("Sec-Fetch-Site");
        return secFetchSite == null;
    }
}
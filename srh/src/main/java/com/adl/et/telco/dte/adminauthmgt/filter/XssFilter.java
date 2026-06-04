package com.adl.et.telco.dte.adminauthmgt.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

@Slf4j
@Component
@Order(2)
public class XssFilter implements Filter {

    private static final Pattern XSS_PATTERN = Pattern.compile(
            "<script[^>]*>.*?</script>"
            + "|</script>"
            + "|javascript\\s*:"
            + "|vbscript\\s*:"
            + "|on[a-z]+\\s*="
            + "|<\\s*(iframe|img|svg|object|embed|link|style|form|base|meta|frame|frameset|applet|layer|ilayer|xml)(\\s|>|/)"
            + "|expression\\s*\\("
            + "|data\\s*:\\s*text/html"
            + "|&#x?[0-9a-f]+;",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        if (!path.contains("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        XssRequestWrapper wrappedRequest = new XssRequestWrapper(httpRequest);

        // Check query parameters
        for (String[] values : wrappedRequest.getParameterMap().values()) {
            for (String value : values) {
                if (value != null && XSS_PATTERN.matcher(value).find()) {
                    log.warn("XSS pattern detected in query parameter for path: {}", path);
                    rejectRequest(httpResponse);
                    return;
                }
            }
        }

        // Check request body for methods that carry a body
        String method = httpRequest.getMethod();
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            String body = wrappedRequest.getBody();
            if (!body.isBlank() && XSS_PATTERN.matcher(body).find()) {
                log.warn("XSS pattern detected in request body for path: {}", path);
                rejectRequest(httpResponse);
                return;
            }
        }

        chain.doFilter(wrappedRequest, response);
    }

    private void rejectRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"code\":\"6103\",\"message\":\"XSS_DETECTED\",\"description\":\"Potential XSS content detected in the request.\"}"
        );
    }
}

package com.adl.et.telco.dte.adminauthmgt.filter;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies the two session requirements enforced by {@link JwtRequestFilter}:
 *
 * <ol>
 *   <li><b>Force re-login on browser restart</b> - the rv_token is issued as a session cookie, so after
 *       the browser is closed and reopened the cookie is gone. A request that still carries a (persisted)
 *       access token but no rv_token cookie must be rejected, sending the user back to log in again.</li>
 *   <li><b>Last-login-wins / auto-logout of the previous session</b> - logging in again rotates the
 *       stored verification token, so the previous browser's now-stale rv_token cookie no longer matches
 *       and that older session must be rejected on its next request.</li>
 * </ol>
 *
 * The happy-path test guards against the filter being too aggressive (a valid, matching session must pass).
 */
class JwtRequestFilterTest {

    @InjectMocks
    private JwtRequestFilter jwtRequestFilter;

    @Mock
    private JwtService jwtService;

    @Mock
    private ResponseHandler responseHandler;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private static final String ACCESS_TOKEN = "valid.access.token";
    private static final String USER_ID = "user1";

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext();

        // Logging / MDC plumbing in JwtRequestFilter.initialData(...)
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("cache-id")).thenReturn(null);
        when(request.getRequestURI()).thenReturn("/srh/user-management/users");
        when(request.getMethod()).thenReturn("GET");

        // Authenticated request carrying a Bearer access token
        when(request.getHeader(ServiceConstants.AUTHORIZATION)).thenReturn(ServiceConstants.BEARER + ACCESS_TOKEN);

        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));
        when(responseHandler.northBoundRespHandler(any(), any())).thenReturn(new CommonNorthBoundResponse<>());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Requirement 1: access token present but the session-scoped rv_token cookie was discarded when the
     * browser closed. The filter must reject the request (HTTP 403) and must not authenticate or forward it.
     */
    @Test
    void rejectsRequestWhenRvTokenCookieMissingAfterBrowserRestart() throws Exception {
        when(jwtService.extractUsername(ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.isTokenExpired(ACCESS_TOKEN)).thenReturn(false);
        // Browser was reopened: no rv_token cookie is sent back.
        when(request.getCookies()).thenReturn(null);

        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(403);
        verify(filterChain, never()).doFilter(any(), any());
        assertNull(SecurityContextHolder.getContext().getAuthentication(),
                "An unauthenticated request must never populate the security context");
    }

    /**
     * Requirement 2: a newer login elsewhere rotated the stored verification token, so this older session's
     * rv_token cookie no longer matches. The filter must reject the request (HTTP 401) - logging the
     * previous session out on its next call.
     */
    @Test
    void rejectsPreviousSessionWhenRvTokenNoLongerMatchesAfterNewLogin() throws Exception {
        when(jwtService.extractUsername(ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.isTokenExpired(ACCESS_TOKEN)).thenReturn(false);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie(ServiceConstants.RV_TOKEN, "stale-rv-token")});
        // The stored token was rotated by the newer login, so the old cookie value does not match.
        when(jwtService.isValidRequestVerificationTokenUsingAccessToken(ACCESS_TOKEN, "stale-rv-token"))
                .thenReturn(false);

        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(401);
        verify(filterChain, never()).doFilter(any(), any());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    /**
     * Guard test: a valid access token whose rv_token cookie still matches the stored token must be
     * authenticated and forwarded down the chain.
     */
    @Test
    void allowsRequestWhenRvTokenMatchesCurrentSession() throws Exception {
        when(jwtService.extractUsername(ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.isTokenExpired(ACCESS_TOKEN)).thenReturn(false);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie(ServiceConstants.RV_TOKEN, "current-rv-token")});
        when(jwtService.isValidRequestVerificationTokenUsingAccessToken(ACCESS_TOKEN, "current-rv-token"))
                .thenReturn(true);
        when(jwtService.isValidToken(ACCESS_TOKEN)).thenReturn(true);
        when(jwtService.extractAuthorities(ACCESS_TOKEN))
                .thenReturn(List.<GrantedAuthority>of(new SimpleGrantedAuthority("100")));

        jwtRequestFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication(),
                "A valid, matching session must be authenticated");
    }
}

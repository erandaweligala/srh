package service.impls.auth;



import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.*;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.UserAuthenticationServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserAuthenticationServiceImplTest {

    @InjectMocks
    private UserAuthenticationServiceImpl userAuthenticationService;

    @Mock
    private JwtService jwtService;

    @Mock
    private CacheRepository cacheRepository;

    @Mock
    private UserDetailClient umsUserClient;

    @Mock
    private ResponseHandler responseHandler;

    @Mock
    private HttpServletRequest httpServletRequest;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // Set private fields via reflection (or you can use @TestPropertySource or constructor injection)
        // Here we use reflection:
        setField(userAuthenticationService, "refreshTimeRange", 300L);
        setField(userAuthenticationService, "timeLimitAC", 600L);
        setField(userAuthenticationService, "prefixAC", "prefixAC_");
        setField(userAuthenticationService, "tempTokenPrefix", "temp_");
    }

    private static void setField(Object target, String fieldName, Object value) {
        try {
            var field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ===== Tests for login() =====

    @Test
    void login_success() throws BaseException {
        String tempToken = "temp.jwt.token";
        String requestVerificationToken = "rv-token";
        UserLoginRequest userLoginRequest = new UserLoginRequest();
        userLoginRequest.setTempToken(tempToken);

        // Stubbing
        when(jwtService.extractUsername(tempToken)).thenReturn("user123");
        when(jwtService.isTokenExpired(tempToken)).thenReturn(false);
        when(jwtService.isValidTempToken(tempToken)).thenReturn(true);
        when(jwtService.isValidRequestVerificationToken(tempToken, requestVerificationToken)).thenReturn(true);

        Map<String, String> tokenMap = Map.of(ServiceConstants.TOKEN, "access.token");
        // Mock createAccessToken to return our map
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doReturn(tokenMap).when(spyService).createAccessToken(tempToken);

        when(responseHandler.responseBuilder(any(AccessTokenResponse.class), eq(AuthCodeEnum.LOGIN_SUCCESS.description()), eq(AuthCodeEnum.LOGIN_SUCCESS.code())))
                .thenReturn(new CommonNorthBoundResponse<>());

        // Run
        CommonNorthBoundResponse<AccessTokenResponse> response = spyService.login(requestVerificationToken, userLoginRequest);

        // Verify key cache interactions
        verify(cacheRepository).deleteKey("temp_user123");
        verify(cacheRepository).save(startsWith("prefixAC_user123"), anyString(), eq(600L));

        // Verify responseHandler called
        verify(responseHandler).responseBuilder(any(AccessTokenResponse.class), eq(AuthCodeEnum.LOGIN_SUCCESS.description()), eq(AuthCodeEnum.LOGIN_SUCCESS.code()));

        assertNotNull(response);
    }

    @Test
    void login_missingTempToken_throwsBaseException() {
        UserLoginRequest userLoginRequest = new UserLoginRequest();
        userLoginRequest.setTempToken(null);

        BaseException ex = assertThrows(BaseException.class, () -> userAuthenticationService.login("someRVToken", userLoginRequest));
        assertEquals(AuthCodeEnum.TEMP_TOKEN_MUST_NOT_BE_NULL.code(), ex.getResultCode());

    }

    // ===== Tests for createAccessToken() =====

    @Test
    void createAccessToken_success() throws BaseException {
        String jwtToken = "jwtToken";

        when(jwtService.extractUsername(jwtToken)).thenReturn("user123");

        UserDetailsForToken userDetails = new UserDetailsForToken();

        PermissionDTO perm1 = new PermissionDTO();
        perm1.setMenuids(List.of(101L, 102L));
        perm1.setComponents(null); // Set null or an empty list if ViewDTO creation is unclear

        PermissionDTO perm2 = new PermissionDTO();
        perm2.setMenuids(List.of(201L, 202L));
        perm2.setComponents(null);

        List<PermissionDTO> permissions = List.of(perm1, perm2);
        //userDetails.setPermission(permissions);


        CommonSouthBoundResponse<UserDetailsForToken> southResponse = new CommonSouthBoundResponse<>();
        // We must set the responseData field (assuming it has setter or public field)
        southResponse.setResponseData(userDetails);

        when(umsUserClient.getUserDetails("user123")).thenReturn(southResponse);

        // Mock jwtService.generateAccessToken to just add token to the map
        doAnswer(invocation -> {
            Map<String, String> map = invocation.getArgument(2);
            map.put(ServiceConstants.TOKEN, "access.token");
            return null;
        }).when(jwtService).generateAccessToken(anyString(), anyMap(), anyMap());

        Map<String, String> tokens = userAuthenticationService.createAccessToken(jwtToken);

        assertEquals("access.token", tokens.get(ServiceConstants.TOKEN));
    }

    @Test
    void createAccessToken_runtimeException_throwsBaseException() {
        String jwtToken = "jwtToken";
        when(jwtService.extractUsername(jwtToken)).thenReturn("user123");
        when(umsUserClient.getUserDetails("user123")).thenThrow(new RuntimeException("fail"));

        BaseException ex = assertThrows(BaseException.class, () -> userAuthenticationService.createAccessToken(jwtToken));
        assertEquals(AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getResultCode());
    }

    // ===== Tests for newAccessToken() =====

    @Test
    void newAccessToken_success() throws BaseException {
        String token = "jwtToken";
        String userId = "user123";
        Date expiration = new Date(System.currentTimeMillis() + 200000); // within refreshTimeRange

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractExpiration(token)).thenReturn(expiration);
        when(jwtService.extractUsername(token)).thenReturn(userId);

        Map<String, String> tokenMap = Map.of(ServiceConstants.TOKEN, "new.access.token");

        // spy to mock createAccessToken
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doReturn(tokenMap).when(spyService).createAccessToken(token);

        when(responseHandler.responseBuilder(any(AccessTokenResponse.class), eq(AuthCodeEnum.LOGIN_SUCCESS.description()), eq(AuthCodeEnum.LOGIN_SUCCESS.code())))
                .thenReturn(new CommonNorthBoundResponse<>());

        CommonNorthBoundResponse<AccessTokenResponse> response = spyService.newAccessToken("rvToken", httpServletRequest);

        verify(cacheRepository).save(startsWith("prefixAC_" + userId), anyString(), eq(600L));
        assertNotNull(response);
    }

    @Test
    void newAccessToken_notInRefreshRange_throwsBaseException() throws BaseException {
        String token = "jwtToken";
        Date expiration = new Date(System.currentTimeMillis() + 1000_000); // much later than refreshTimeRange

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractExpiration(token)).thenReturn(expiration);

        BaseException ex = assertThrows(BaseException.class,
                () -> userAuthenticationService.newAccessToken("rvToken", httpServletRequest));
        assertEquals(AuthCodeEnum.NOT_IN_REFRESH_TIME.code(), ex.getResultCode());
    }

    // ===== Tests for userLogOut() =====

    @Test
    void userLogOut_success_userExistsInCache() throws BaseException {
        String token = "jwtToken";
        String username = "user123";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractUsername(token)).thenReturn(username);
        when(cacheRepository.existsByUserId(username)).thenReturn(true);

        when(responseHandler.responseBuilder(null, AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.description()))
                .thenReturn(new CommonNorthBoundResponse<>());

        CommonNorthBoundResponse<String> response = userAuthenticationService.userLogOut(httpServletRequest);

        verify(cacheRepository).delete(username);
        assertNotNull(response);
    }

    @Test
    void userLogOut_success_userNotInCache() throws BaseException {
        String token = "jwtToken";
        String username = "user123";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractUsername(token)).thenReturn(username);
        when(cacheRepository.existsByUserId(username)).thenReturn(false);
    }

    // --- login() exception branches ---
    @Test
    void login_throwsBaseException() throws BaseException {
        UserLoginRequest req = new UserLoginRequest();
        req.setTempToken("token");
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "123", null))
                .when(spyService).createAccessToken(anyString());

        when(jwtService.extractUsername(anyString())).thenReturn("user");
        when(jwtService.isTokenExpired(anyString())).thenReturn(false);
        when(jwtService.isValidTempToken(anyString())).thenReturn(true);
        when(jwtService.isValidRequestVerificationToken(anyString(), anyString())).thenReturn(true);

        BaseException ex = assertThrows(BaseException.class, () -> spyService.login("rv", req));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void login_throwsGenericException() throws BaseException {
        UserLoginRequest req = new UserLoginRequest();
        req.setTempToken("token");
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doThrow(new RuntimeException("fail"))
                .when(spyService).createAccessToken(anyString());

        when(jwtService.extractUsername(anyString())).thenReturn("user");
        when(jwtService.isTokenExpired(anyString())).thenReturn(false);
        when(jwtService.isValidTempToken(anyString())).thenReturn(true);
        when(jwtService.isValidRequestVerificationToken(anyString(), anyString())).thenReturn(true);

        BaseException ex = assertThrows(BaseException.class, () -> spyService.login("rv", req));
        assertEquals(AuthCodeEnum.LOGIN_INTERNAL_SERVER_ERROR.code(), ex.getResultCode());
    }

    // --- newAccessToken() exception branches ---
    @Test
    void newAccessToken_throwsBaseException() throws BaseException {
        String token = "jwtToken";
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractExpiration(token)).thenReturn(new Date());
        when(jwtService.extractUsername(token)).thenReturn("user");
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "123", null))
                .when(spyService).createAccessToken(token);

        BaseException ex = assertThrows(BaseException.class, () -> spyService.newAccessToken("rv", httpServletRequest));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void newAccessToken_throwsGenericException() throws BaseException {
        String token = "jwtToken";
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractExpiration(token)).thenReturn(new Date());
        when(jwtService.extractUsername(token)).thenReturn("user");
        UserAuthenticationServiceImpl spyService = Mockito.spy(userAuthenticationService);
        doThrow(new RuntimeException("fail"))
                .when(spyService).createAccessToken(token);

        BaseException ex = assertThrows(BaseException.class, () -> spyService.newAccessToken("rv", httpServletRequest));
        assertEquals(AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getResultCode());
    }

    // --- userLogOut() exception branches ---
    @Test
    void userLogOut_throwsBaseException() {
        when(jwtService.tokenExtractor(httpServletRequest)).thenThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "123", null));
        BaseException ex = assertThrows(BaseException.class, () -> userAuthenticationService.userLogOut(httpServletRequest));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void userLogOut_throwsGenericException() {
        when(jwtService.tokenExtractor(httpServletRequest)).thenThrow(new RuntimeException("fail"));
        BaseException ex = assertThrows(BaseException.class, () -> userAuthenticationService.userLogOut(httpServletRequest));
        assertEquals(AuthCodeEnum.LOGOUT_INTERNAL_SERVER_ERROR.code(), ex.getResultCode());
    }

}
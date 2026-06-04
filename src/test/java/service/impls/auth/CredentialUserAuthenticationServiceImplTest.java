package service.impls.auth;

import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.*;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.CredentialUserAuthenticationServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.Constants;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import org.jboss.logging.MDC;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.token.Token;
import org.springframework.security.core.token.TokenService;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class CredentialUserAuthenticationServiceImplTest {

    @Mock
    private UserDetailClient userDetailClient;

    @Spy
    @InjectMocks
    private CredentialUserAuthenticationServiceImpl authenticationService;

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

    @Mock
    private TokenService tokenService;



    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogin_Success() throws BaseException {
        // Setup
        String requestVerificationToken = "dummyRVToken";
        CredentialUserLoginRequest loginRequest = new CredentialUserLoginRequest();
        loginRequest.setTenant("tenant1");
        loginRequest.setClientId("client123");

        String rawUsername = "mockUser@email.com";
        String extractedUsername = "mockUser";

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler));


        // Mock dependencies
        CommonSouthBoundResponse<String> umsResponse = new CommonSouthBoundResponse<>();
        umsResponse.setResponseData(rawUsername);
        doReturn(umsResponse).when(umsUserClient).getUserName(any(CredentialUserLoginRequest.class));


        Map<String, String> mockAccessTokenMap = new HashMap<>();
        mockAccessTokenMap.put(ServiceConstants.TOKEN, "mockAccessToken");
        doReturn(mockAccessTokenMap).when(spyService).createAccessToken(extractedUsername, loginRequest.getTenant());

        doNothing().when(cacheRepository).deleteKey(anyString());
        doNothing().when(cacheRepository).save(anyString(), anyString(), anyLong());

        when(responseHandler.responseBuilder(any(), anyString(), anyString()))
                .thenReturn(new CommonNorthBoundResponse<>());

        // ReflectionTestUtils to set internal fields
        ReflectionTestUtils.setField(spyService, "tempTokenPrefix", "temp_");
        ReflectionTestUtils.setField(spyService, "prefixAC", "ac_");
        ReflectionTestUtils.setField(spyService, "timeLimitAC", 1000L);

        // Act
        CommonNorthBoundResponse<AccessTokenResponse> response = spyService.login(requestVerificationToken, loginRequest);

        // Assert
        assertNotNull(response);

        // Optionally verify interactions
        verify(umsUserClient).getUserName(loginRequest);
        verify(cacheRepository).deleteKey("temp_" + extractedUsername);
        verify(cacheRepository).save(startsWith("ac_" + extractedUsername), anyString(), eq(1000L));
        verify(responseHandler).responseBuilder(any(AccessTokenResponse.class), eq(AuthCodeEnum.LOGIN_SUCCESS.description()), eq(AuthCodeEnum.LOGIN_SUCCESS.code()));
    }


    @Test
    void testLogin_Failure_UserNotFound() throws BaseException {
        // Setup
        String requestVerificationToken = "dummyRVToken";
        CredentialUserLoginRequest loginRequest = new CredentialUserLoginRequest();
        loginRequest.setTenant("tenant1");
        loginRequest.setClientId("client123");

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler));

        // Mock umsUserClient to throw BaseException (user not found)
        doThrow(new BaseException("User not found", "reason", HttpStatus.NOT_FOUND, "code", null))
                .when(umsUserClient).getUserName(any(CredentialUserLoginRequest.class));

        // ReflectionTestUtils to set internal fields
        ReflectionTestUtils.setField(spyService, "tempTokenPrefix", "temp_");
        ReflectionTestUtils.setField(spyService, "prefixAC", "ac_");
        ReflectionTestUtils.setField(spyService, "timeLimitAC", 1000L);

        // Act & Assert
        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.login(requestVerificationToken, loginRequest)
        );
        assertEquals("User not found", ex.getMessage());

        // Optionally verify that no further interactions happened
        verify(cacheRepository, never()).deleteKey(anyString());
        verify(cacheRepository, never()).save(anyString(), anyString(), anyLong());
        verify(responseHandler, never()).responseBuilder(any(), anyString(), anyString());
    }



    @Test
    void testCreateAccessToken_Success() throws BaseException {
        String username = "user1";
        String tenantId = "tenantX";

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        // Mock user details response
        UserDetailsForToken userDetails = new UserDetailsForToken();
        userDetails.setEmail("user1@example.com");
        userDetails.setName("User One");
        userDetails.setRole("Admin");
        userDetails.setMsisdn("1234567890");
        userDetails.setStatus(Constants.ACTIVE);
        userDetails.setPermission(new PermissionDTO());

        CommonSouthBoundResponse<UserDetailsForToken> userDetailsResponse = new CommonSouthBoundResponse<>();
        userDetailsResponse.setResponseData(userDetails);

        when(umsUserClient.getUserDetails(username)).thenReturn(userDetailsResponse);

        // Mock JWT service
        doAnswer(invocation -> {
            Map<String, String> map = invocation.getArgument(2);
            map.put(ServiceConstants.TOKEN, "dummyToken");
            return null;
        }).when(jwtService).generateAccessToken(anyString(), anyMap(), anyMap());


        // Execute the method under test
        Map<String, String> result = spyService.createAccessToken(username, tenantId);

        // Assertions
        assertNotNull(result);
        assertEquals("dummyToken", result.get(ServiceConstants.TOKEN));
        verify(umsUserClient).getUserDetails(username);
        verify(jwtService).generateAccessToken(eq(username), anyMap(), anyMap());
    }




    @Test
    void testNewAccessToken_Success() throws BaseException {
        // Setup
        String jwtToken = "dummyJwtToken";
        String rvToken = "dummyRVToken";
        String username = "user1";
        // Set expiration to just within the refresh window (e.g., 1 second ahead)
        Date expiration = new Date(System.currentTimeMillis() + 1000);

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        // Set internal fields
        ReflectionTestUtils.setField(spyService, "prefixAC", "ac_");
        ReflectionTestUtils.setField(spyService, "timeLimitAC", 1000L);
        ReflectionTestUtils.setField(spyService, "refreshTimeRange", 60L); // 60 seconds refresh window

        // Mock JWT operations
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(jwtToken);
        when(jwtService.extractExpiration(jwtToken)).thenReturn(expiration);
        when(jwtService.extractUsername(jwtToken)).thenReturn(username);

        // Mock createAccessToken
        Map<String, String> mockAccessTokenMap = new HashMap<>();
        mockAccessTokenMap.put(ServiceConstants.TOKEN, "mockAccessToken");
        doReturn(mockAccessTokenMap).when(spyService).createAccessToken(username, null);

        // Mock cache and response
        doNothing().when(cacheRepository).save(anyString(), anyString(), anyLong());
        when(responseHandler.responseBuilder(any(), anyString(), anyString()))
                .thenReturn(new CommonNorthBoundResponse<>());

        // Act
        CommonNorthBoundResponse<AccessTokenResponse> result =
                spyService.newAccessToken(rvToken, httpServletRequest);

        // Assert
        assertNotNull(result);
    }


    @Test
    void testUserLogOut_Success() {
        // Arrange
        String dummyJwtToken = "dummyJwtToken";
        String username = "user1";

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        // (Optional) Set internal fields if needed
        //ReflectionTestUtils.setField(spyService, "someField", someValue);

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(dummyJwtToken);
        when(jwtService.extractUsername(dummyJwtToken)).thenReturn(username);
        when(cacheRepository.existsByUserId(username)).thenReturn(true);
        doNothing().when(cacheRepository).delete(username);

        CommonNorthBoundResponse<String> mockResponse = new CommonNorthBoundResponse<>();
        mockResponse.setData("Logout Successful");
        mockResponse.setCode(AuthCodeEnum.AUTH_REQUEST_SUCCESS.code());
        mockResponse.setDescription(AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());

        when(responseHandler.responseBuilder(
                null,
                AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(),
                AuthCodeEnum.AUTH_REQUEST_SUCCESS.description()
        )).thenReturn((CommonNorthBoundResponse) mockResponse);

        // Act
        CommonNorthBoundResponse<String> response = spyService.userLogOut(httpServletRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Logout Successful", response.getData());
        verify(jwtService).tokenExtractor(httpServletRequest);
        verify(jwtService).extractUsername(dummyJwtToken);
        verify(cacheRepository).existsByUserId(username);
        verify(cacheRepository).delete(username);
        verify(responseHandler).responseBuilder(null, AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());
    }



    @Test
    void testUserLogOut_UserNotExists() {
        // Arrange
        String dummyJwtToken = "dummyJwtToken";
        String username = "user1";

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(dummyJwtToken);
        when(jwtService.extractUsername(dummyJwtToken)).thenReturn(username);
        when(cacheRepository.existsByUserId(username)).thenReturn(false);

        CommonNorthBoundResponse<String> mockResponse = new CommonNorthBoundResponse<>();
        mockResponse.setData(null);
        mockResponse.setCode(AuthCodeEnum.AUTH_REQUEST_SUCCESS.code());
        mockResponse.setDescription(AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());

        when(responseHandler.responseBuilder(
                null,
                AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(),
                AuthCodeEnum.AUTH_REQUEST_SUCCESS.description()
        )).thenReturn((CommonNorthBoundResponse)mockResponse);

        // Act
        CommonNorthBoundResponse<String> response = spyService.userLogOut(httpServletRequest);

        // Assert
        assertNotNull(response);
        assertEquals(AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), response.getCode());
        assertEquals(AuthCodeEnum.AUTH_REQUEST_SUCCESS.description(), response.getDescription());
        verify(cacheRepository, never()).delete(username);
        verify(responseHandler).responseBuilder(null, AuthCodeEnum.AUTH_REQUEST_SUCCESS.code(), AuthCodeEnum.AUTH_REQUEST_SUCCESS.description());
    }


    @Test
    void testCreateAccessToken_Failure_RuntimeException() {
        String username = "user1";
        String tenantId = "tenantX";

        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        // Simulate umsUserClient throwing a RuntimeException
        when(umsUserClient.getUserDetails(username)).thenThrow(new RuntimeException("DB error"));

        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.createAccessToken(username, tenantId)
        );
        assertEquals("DB error", ex.getMessage());
        assertEquals(AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.description(), ex.getReason());
        assertEquals(AuthCodeEnum.CREATE_ACCESS_TOKEN_FAILED.code(), ex.getResultCode());
    }


    @Test
    void testNewAccessToken_ThrowsBaseException() throws BaseException {
        String dummyJwtToken = "dummyJwtToken";
        String dummyRVToken = "dummyRVToken";
        // Set expiration to far in the future (not in refresh window)
        Date expirationDate = new Date(System.currentTimeMillis() + 1000000);

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        // Set internal fields
        ReflectionTestUtils.setField(spyService, "refreshTimeRange", 60L);

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(dummyJwtToken);
        when(jwtService.extractExpiration(dummyJwtToken)).thenReturn(expirationDate);

        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.newAccessToken(dummyRVToken, httpServletRequest)
        );
        assertEquals(AuthCodeEnum.NOT_IN_REFRESH_TIME.description(), ex.getMessage());
    }

    @Test
    void testNewAccessToken_ThrowsGenericException() throws BaseException {
        String dummyJwtToken = "dummyJwtToken";
        String dummyRVToken = "dummyRVToken";

        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(dummyJwtToken);
        when(jwtService.extractExpiration(dummyJwtToken)).thenThrow(new RuntimeException("Unexpected error"));

        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.newAccessToken(dummyRVToken, httpServletRequest)
        );
        assertEquals("Unexpected error", ex.getMessage());
    }

    @Test
    void testUserLogOut_ThrowsBaseException() {
        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        when(jwtService.tokenExtractor(httpServletRequest))
                .thenThrow(new BaseException("err", "reason", HttpStatus.BAD_REQUEST, "code", null));

        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.userLogOut(httpServletRequest)
        );
        assertEquals("err", ex.getMessage());
    }

    @Test
    void testUserLogOut_ThrowsGenericException() {
        // Spy on the service
        CredentialUserAuthenticationServiceImpl spyService = Mockito.spy(
                new CredentialUserAuthenticationServiceImpl(jwtService, cacheRepository, umsUserClient, responseHandler)
        );

        when(jwtService.tokenExtractor(httpServletRequest))
                .thenThrow(new RuntimeException("fail"));

        BaseException ex = assertThrows(BaseException.class, () ->
                spyService.userLogOut(httpServletRequest)
        );
        assertEquals("fail", ex.getMessage());
    }




}


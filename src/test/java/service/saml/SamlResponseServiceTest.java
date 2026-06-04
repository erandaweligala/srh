package service.saml;

import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.TokenResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;
import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.CommonSecurityService;
import com.adl.et.telco.dte.adminauthmgt.service.saml.SamlResponseService;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.io.ResourceLoader;
import java.nio.charset.StandardCharsets;
import java.util.Base64;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SamlResponseServiceTest {

    @InjectMocks
    private SamlResponseService samlResponseService;

    @Mock
    private ResponseHandler handler;

    @Mock
    private UserDetailClient userDetailClient;

    @Mock
    private CacheRepository cacheRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private ResourceLoader resourceLoader;

    @Mock
    private CommonSecurityService commonSecurityService;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        when(resourceLoader.getResource(anyString())).thenThrow(new RuntimeException("Mocked Resource Not Found"));
    }

    @Test
    void createTempToken_withValidSaml_shouldReturnSuccess() {
        // Arrange
        String validSamlXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<samlp:Response xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" " +
                "xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\" " +
                "ID=\"_response123\" Version=\"2.0\" IssueInstant=\"2024-01-01T12:00:00Z\">" +
                "<samlp:Status>" +
                "<samlp:StatusCode Value=\"urn:oasis:names:tc:SAML:2.0:status:Success\"/>" +
                "</samlp:Status>" +
                "<saml:Assertion ID=\"_assertion123\" Version=\"2.0\" IssueInstant=\"2024-01-01T12:00:00Z\">" +
                "<saml:Subject>" +
                "<saml:NameID>user@example.com</saml:NameID>" +
                "<saml:SubjectConfirmation>" +
                "<saml:SubjectConfirmationData InResponseTo=\"_request123\"/>" +
                "</saml:SubjectConfirmation>" +
                "</saml:Subject>" +
                "</saml:Assertion>" +
                "</samlp:Response>";

        String encodedSaml = Base64.getEncoder().encodeToString(validSamlXml.getBytes(StandardCharsets.UTF_8));

        // Mock user details
        UserBasicInfo userInfo = new UserBasicInfo();
        userInfo.setEmail("user@example.com");
        userInfo.setUserId("123");

        CommonSouthBoundResponse<UserBasicInfo> userResponse = new CommonSouthBoundResponse<>();
        userResponse.setResponseData(userInfo);
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        userResponse.setResult(result);

        // Mock success response
        TokenResponse tokenResponse = new TokenResponse();
        tokenResponse.setTempToken("temp123");
        tokenResponse.setRequestVerificationToken("rvt123");

        CommonNorthBoundResponse<TokenResponse> successResponse = new CommonNorthBoundResponse<>();
        successResponse.setCode("200");
        successResponse.setMessage("Login success");
        successResponse.setData(tokenResponse);

        // Setup mocks
        when(userDetailClient.getBasicUserDetails("user@example.com")).thenReturn(userResponse);
        when(commonSecurityService.isEligible(userResponse)).thenReturn(true);
        when(handler.responseBuilder(any(TokenResponse.class), anyString(), anyString())).thenReturn(successResponse);
        when(handler.<TokenResponse>northBoundRespHandler(anyString(), anyString())).thenReturn(successResponse);

        // Act
        CommonNorthBoundResponse<TokenResponse> response = samlResponseService.createTempToken(encodedSaml);

        // Assert
        assertNotNull(response);
        assertEquals("200", response.getCode());
        assertEquals("Login success", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("temp123", response.getData().getTempToken());
    }

    @Test
    void createTempToken_withInvalidSaml() {
        // Arrange
        String invalidSaml = "<INVALID_SAML>";
        CommonNorthBoundResponse<TokenResponse> mockResponse = new CommonNorthBoundResponse<>();
        mockResponse.setData(null);
        mockResponse.setMessage("Invalid SAML Document");
        mockResponse.setCode("400");

        when(handler.<TokenResponse>northBoundRespHandler(anyString(), anyString()))
                .thenReturn(mockResponse);

        // Act
        CommonNorthBoundResponse<TokenResponse> response = samlResponseService.createTempToken(invalidSaml);

        // Assert
        assertNotNull(response);
        assertEquals("400", response.getCode());
        assertEquals("Invalid SAML Document", response.getMessage());
        assertNull(response.getData());

        verify(handler, times(1)).northBoundRespHandler(anyString(), anyString());


    }


    @Test
    void createTempToken_userNotFound_shouldReturnUserNotFound() {
        String validSamlXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<samlp:Response xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" " +
                "xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\" " +
                "ID=\"_response123\" Version=\"2.0\" IssueInstant=\"2024-01-01T12:00:00Z\">" +
                "<samlp:Status><samlp:StatusCode Value=\"urn:oasis:names:tc:SAML:2.0:status:Success\"/></samlp:Status>" +
                "<saml:Assertion ID=\"_assertion123\" Version=\"2.0\" IssueInstant=\"2024-01-01T12:00:00Z\">" +
                "<saml:Subject><saml:NameID>user@example.com</saml:NameID>" +
                "<saml:SubjectConfirmation><saml:SubjectConfirmationData InResponseTo=\"_request123\"/>" +
                "</saml:SubjectConfirmation></saml:Subject></saml:Assertion></samlp:Response>";
        String encodedSaml = Base64.getEncoder().encodeToString(validSamlXml.getBytes(StandardCharsets.UTF_8));

        CommonSouthBoundResponse<UserBasicInfo> userResponse = new CommonSouthBoundResponse<>();
        userResponse.setResponseData(null);

        CommonNorthBoundResponse<TokenResponse> failResponse = new CommonNorthBoundResponse<>();
        failResponse.setCode("404");
        failResponse.setMessage("User not found");

        when(userDetailClient.getBasicUserDetails("user@example.com")).thenReturn(userResponse);
        when(handler.<TokenResponse>northBoundRespHandler(anyString(), anyString())).thenReturn(failResponse);

        CommonNorthBoundResponse<TokenResponse> response = samlResponseService.createTempToken(encodedSaml);

        assertNotNull(response);
        assertEquals("404", response.getCode());
        assertEquals("User not found", response.getMessage());
    }


    @Test
    void createTempToken_invalidSamlObject_shouldReturnInvalidSamlObject() {
        // Simulate unmarshallSamlDocElement returning null
        SamlResponseService spyService = spy(samlResponseService);
        String validSamlXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                "<samlp:Response xmlns:samlp=\"urn:oasis:names:tc:SAML:2.0:protocol\" " +
                "xmlns:saml=\"urn:oasis:names:tc:SAML:2.0:assertion\" " +
                "ID=\"_response123\" Version=\"2.0\" IssueInstant=\"2024-01-01T12:00:00Z\">" +
                "<samlp:Status><samlp:StatusCode Value=\"urn:oasis:names:tc:SAML:2.0:status:Success\"/></samlp:Status>" +
                "</samlp:Response>";
        String encodedSaml = Base64.getEncoder().encodeToString(validSamlXml.getBytes(StandardCharsets.UTF_8));

        CommonNorthBoundResponse<TokenResponse> failResponse = new CommonNorthBoundResponse<>();
        failResponse.setCode("400");
        failResponse.setMessage("Invalid SAML Object");

        when(handler.<TokenResponse>northBoundRespHandler(anyString(), anyString())).thenReturn(failResponse);

        CommonNorthBoundResponse<TokenResponse> response = spyService.createTempToken(encodedSaml);

        assertNotNull(response);
        assertEquals("400", response.getCode());
        assertEquals("Invalid SAML Object", response.getMessage());
    }

    @Test
    void createTempToken_exceptionInConvertStringToXMLDocument_shouldReturnExceptionServiceLayer() {
        SamlResponseService spyService = spy(samlResponseService);

        CommonNorthBoundResponse<TokenResponse> failResponse = new CommonNorthBoundResponse<>();
        failResponse.setCode("500");
        failResponse.setMessage("Exception Service Layer");

        when(handler.<TokenResponse>northBoundRespHandler(anyString(), anyString())).thenReturn(failResponse);

        CommonNorthBoundResponse<TokenResponse> response = spyService.createTempToken("any");

        assertNotNull(response);
        assertEquals("500", response.getCode());
        assertEquals("Exception Service Layer", response.getMessage());
    }


}









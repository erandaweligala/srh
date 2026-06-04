package service.impls.common;

import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.common.ExternalAPICallServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.slf4j.MDC;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ExternalAPICallServiceImplTest {

    @Mock
    private RestTemplate restTemplate;
    @Mock
    private HttpServletRequest httpServletRequest;
    @Mock
    private UserActivityLogInterface userActivityLogInterface;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    @Spy
    private ExternalAPICallServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        MDC.put(AdminAuthConstant.TRACE_ID, "trace-123");
        // Set required fields if needed, e.g. tenantId
        ReflectionTestUtils.setField(service, "tenantId", "tenant");
    }

    @Test
    void externalGetAPICall_ReturnsExpectedResponse() throws Exception {
        // Arrange
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "GET_ACTION";
        Map<String, String> valueMap = Map.of("param", "val");
        String finalUrl = url + "?param=val";
        String expectedResponse = "api-response";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // Act
        String result = service.externalGetAPICall(userName, email, role, url, actionNames, valueMap,1,"View");

        // Assert
        assertEquals(expectedResponse, result);
        verify(userActivityLogInterface).logUserActivity(
                eq(actionNames),
                eq("trace-123"),
                eq(valueMap.toString()),
                eq(finalUrl),
                eq("user"),
                eq(1),
                eq("View")
        );
        verify(userActivityLogInterface).updateStatus(eq("trace-123"), eq(ServiceConstants.SUCCESS), eq(ServiceConstants.SUCCESS_DESCRIPTION));
        verify(restTemplate).exchange(eq(finalUrl), eq(org.springframework.http.HttpMethod.GET), any(), eq(String.class));
    }

    @Test
    void externalGetAPICall_CallsRestTemplateWithCorrectArguments() throws Exception {
        // Arrange
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "GET_ACTION";
        Map<String, String> valueMap = Map.of("param", "val");
        String finalUrl = url + "?param=val";
        String expectedResponse = "api-response";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        // Mock the RestTemplate exchange call
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // Act
        String result = service.externalGetAPICall(userName, email, role, url, actionNames, valueMap,1,"View");

        // Assert
        assertEquals(expectedResponse, result);
        verify(restTemplate).exchange(eq(finalUrl), eq(org.springframework.http.HttpMethod.GET), any(), eq(String.class));
    }

    @Test
    void externalPutAPICall_CallsRestTemplateWithCorrectArguments() throws Exception {
        // Arrange
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "PUT_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");
        String finalUrl = url + "?param=val";
        String expectedResponse = "put-response";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.PUT), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // Act
        String result = service.externalPutAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View");

        // Assert
        assertEquals(expectedResponse, result);
        verify(userActivityLogInterface).logUserActivity(
                eq(actionNames),
                eq("trace-123"),
                eq(request.toString()),
                eq(finalUrl),
                eq("user"),
                eq(1),
                eq("View")
        );
        verify(userActivityLogInterface).updateStatus(eq("trace-123"), eq(ServiceConstants.SUCCESS), eq(ServiceConstants.SUCCESS_DESCRIPTION));
        verify(restTemplate).exchange(eq(finalUrl), eq(org.springframework.http.HttpMethod.PUT), any(), eq(String.class));
    }

    @Test
    void externalDeleteAPICall_CallsRestTemplateWithCorrectArguments() throws Exception {
        // Arrange
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "DELETE_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");
        String finalUrl = url + "?param=val";
        String expectedResponse = "delete-response";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.DELETE), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // Act
        String result = service.externalDeleteAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View");

        // Assert
        assertEquals(expectedResponse, result);
        verify(userActivityLogInterface).logUserActivity(
                eq(actionNames),
                eq("trace-123"),
                eq(request.toString()),
                eq(finalUrl),
                eq("user"),
                eq(1),
                eq("View")
        );
        verify(userActivityLogInterface).updateStatus(eq("trace-123"), eq(ServiceConstants.SUCCESS), eq(ServiceConstants.SUCCESS_DESCRIPTION));
        verify(restTemplate).exchange(eq(finalUrl), eq(org.springframework.http.HttpMethod.DELETE), any(), eq(String.class));
    }


    @Test
    void externalPostUploadAPICall_ReturnsExpectedResponse() throws Exception {
        String userName = "user";
        String url = "http://example.com/upload";
        Map<String, String> valueMap = Map.of("requestHeader.fileName", "test.txt");
        String finalUrl = url + "?requestHeader.fileName=test.txt"; // <-- Fix here
        String expectedResponse = "upload-success";
        String catalogId = "catalog-123";
        byte[] fileBytes = "file-content".getBytes();

        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.txt");
        when(multipartFile.getBytes()).thenReturn(fileBytes);

        when(httpServletRequest.getHeader("catalogId")).thenReturn(catalogId);

        ResponseEntity<String> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // Act
        String result = service.externalPostUploadAPICall(userName, url, multipartFile, valueMap);

        // Assert
        assertEquals(expectedResponse, result);
        verify(restTemplate).postForEntity(eq(finalUrl), any(HttpEntity.class), eq(String.class));
        verify(multipartFile, times(2)).getOriginalFilename();
        verify(multipartFile).getBytes();
    }

    // Java
    @Test
    void externalPostAPICall_ReturnsExpectedResponse() throws Exception {
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "POST_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");
        String finalUrl = url + "?param=val";
        String expectedResponse = "post-response";

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        String result = service.externalPostAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View");

        assertEquals(expectedResponse, result);
        verify(restTemplate).exchange(eq(finalUrl), eq(org.springframework.http.HttpMethod.POST), any(), eq(String.class));
    }

    @Test
    void externalGetAPICall_ThrowsBaseExceptionOnRestTemplateError() throws Exception {
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "GET_ACTION";
        Map<String, String> valueMap = Map.of("param", "val");

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.GET), any(), eq(String.class)))
                .thenThrow(new RuntimeException("fail"));

        assertThrows(BaseException.class, () ->
                service.externalGetAPICall(userName, email, role, url, actionNames, valueMap,1,"View"));
    }

    @Test
    void externalPostAPICall_ThrowsBaseExceptionOnRestTemplateError() throws Exception {
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "POST_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.POST), any(), eq(String.class)))
                .thenThrow(new RuntimeException("fail"));

        assertThrows(BaseException.class, () ->
                service.externalPostAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View"));
    }

    @Test
    void externalPutAPICall_ThrowsBaseExceptionOnRestTemplateError() throws Exception {
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "PUT_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.PUT), any(), eq(String.class)))
                .thenThrow(new RuntimeException("fail"));

        assertThrows(BaseException.class, () ->
                service.externalPutAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View"));
    }

    @Test
    void externalDeleteAPICall_ThrowsBaseExceptionOnRestTemplateError() throws Exception {
        String userName = "user";
        String email = "user@email.com";
        String role = "admin";
        String url = "http://example.com/api";
        String actionNames = "DELETE_ACTION";
        Object request = Map.of("key", "value");
        Map<String, String> valueMap = Map.of("param", "val");

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(restTemplate.exchange(anyString(), eq(org.springframework.http.HttpMethod.DELETE), any(), eq(String.class)))
                .thenThrow(new RuntimeException("fail"));

        assertThrows(BaseException.class, () ->
                service.externalDeleteAPICall(userName, email, role, url, actionNames, request, valueMap,1,"View"));
    }


    @Test
    void externalPostUploadAPICall_CatalogIdDefault() throws Exception {
        String userName = "user";
        String url = "http://example.com/upload";
        Map<String, String> valueMap = Map.of("requestHeader.fileName", "test.txt");
        String expectedResponse = "upload-success";
        byte[] fileBytes = "file-content".getBytes();

        MultipartFile multipartFile = mock(MultipartFile.class);
        when(multipartFile.getOriginalFilename()).thenReturn("test.txt");
        when(multipartFile.getBytes()).thenReturn(fileBytes);

        when(httpServletRequest.getHeader("catalogId")).thenReturn("default");

        ResponseEntity<String> responseEntity = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        String result = service.externalPostUploadAPICall(userName, url, multipartFile, valueMap);

        assertEquals(expectedResponse, result);
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }
}
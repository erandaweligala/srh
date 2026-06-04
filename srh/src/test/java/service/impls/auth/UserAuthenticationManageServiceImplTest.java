package service.impls.auth;

import com.adl.et.telco.dte.adminauthmgt.dto.authentication.SamlRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.UserAuthenticationManageServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import java.lang.reflect.Field;

import org.mockito.MockitoAnnotations;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserAuthenticationManageServiceImplTest {

    @InjectMocks
    private UserAuthenticationManageServiceImpl userAuthenticationManageService;

    @Mock
    private ResponseHandler responseHandler;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        setField("azureTenantId", "mockTenantId");
        setField("issuerUrl", "https://mockissuer.com");
        setField("redirectionUrl", "https://mockredirection.com/{tenantId}/{uriEncode}");

    }

    private void setField(String fieldName, Object value) throws Exception {
        Field field = UserAuthenticationManageServiceImpl.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(userAuthenticationManageService, value);
    }

    @Test
    void createSamlRequest_Success() throws Exception {
        try {
            // Arrange
            String uuid = "mockUUID";
            String expectedUrl = "https://mockredirection.com/mockTenantId/mockEncodedUri";

            // Mock response
            SamlRequest samlRequest = new SamlRequest();
            samlRequest.setUrl(expectedUrl);
            CommonNorthBoundResponse<SamlRequest> mockedResponse = new CommonNorthBoundResponse<>();
            mockedResponse.setData(samlRequest);

            // Mock behavior
            when(responseHandler.responseBuilder(
                    any(SamlRequest.class),
                    eq(AuthCodeEnum.AUTH_REQUEST_SUCCESS.description()),
                    eq(AuthCodeEnum.AUTH_REQUEST_SUCCESS.code()))
            ).thenReturn(mockedResponse);

            // Act
            CommonNorthBoundResponse<SamlRequest> actualResponse = userAuthenticationManageService.createSamlRequest(uuid);

            // Debug logs
            System.out.println("Actual Response: " + actualResponse);
            System.out.println("Actual URL: " + actualResponse.getData().getUrl());

            // Assert
            assertNotNull(actualResponse, "Response should not be null");
            assertNotNull(actualResponse.getData(), "Response data should not be null");
            assertEquals(expectedUrl, actualResponse.getData().getUrl(), "URLs should match");

            // Verify method calls
            verify(responseHandler).responseBuilder(
                    any(SamlRequest.class),
                    eq(AuthCodeEnum.AUTH_REQUEST_SUCCESS.description()),
                    eq(AuthCodeEnum.AUTH_REQUEST_SUCCESS.code())
            );
        } catch (BaseException e) {
            fail("BaseException should not be thrown: " + e.getMessage());
        }
    }

}



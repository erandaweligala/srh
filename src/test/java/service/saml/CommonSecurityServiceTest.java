package service.saml;

import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.saml.CommonSecurityService;
import com.adl.et.telco.dte.adminauthmgt.util.access.UserStatusEnum;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;

class CommonSecurityServiceTest {
    private final CommonSecurityService commonSecurityService = new CommonSecurityService();

    @Test
    void testIsEligible_Success() throws BaseException {
        // Arrange
        CommonSouthBoundResponse<UserBasicInfo> mockResponse = new CommonSouthBoundResponse<>();
        UserBasicInfo userBasicInfo = new UserBasicInfo();
        userBasicInfo.setStatus(UserStatusEnum.ACTIVE.code());
        mockResponse.setResponseData(userBasicInfo);

        // Act
        boolean result = commonSecurityService.isEligible(mockResponse);

        // Assert
        assertTrue(result, "The user should be eligible when status is ACTIVE");

    }

    @Test
    void testIsEligible_ExceptionThrown(){
        // Arrange
        CommonSouthBoundResponse<UserBasicInfo> mockResponse = new CommonSouthBoundResponse<>();
        mockResponse.setResponseData(null);

        // Act & Assert
        BaseException exception = assertThrows(BaseException.class, () -> {
            commonSecurityService.isEligible(mockResponse);
        });

        // Assert exception details

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getHttpStatus());
    }

}
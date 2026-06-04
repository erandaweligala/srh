package service.impls.auth;

import com.adl.et.telco.dte.adminauthmgt.client.auth.UserDetailClient;
import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.UserDetailsServiceImplementation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserDetailsServiceImplementationTest {
    @Mock
    private UserDetailClient userDetailClient; // Mock dependencies.

    @InjectMocks
    private UserDetailsServiceImplementation userDetailsService; // use concrete class here.

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this); // Initialize Mocks
    }



    @Test
    void testLoadUserByUsername_Success() throws Exception{
        // Arrange
        String email = "test@example.com";
        UserBasicInfo mockUserInfo = new UserBasicInfo();
        mockUserInfo.setEmail(email);


        CommonSouthBoundResponse<UserBasicInfo> mockResponse = new CommonSouthBoundResponse<>();
        mockResponse.setResponseData(mockUserInfo);

        when(userDetailClient.getBasicUserDetails(email)).thenReturn(mockResponse);

        // Act
        UserDetails result = userDetailsService.loadUserByUsername(email);

        // Arrange
        assertNotNull(result);
        assertEquals(email, result.getUsername());
        verify(userDetailClient, times(1)).getBasicUserDetails(email);

    }

    @Test
    void testLoadUserByUsername_UserNotFound() throws Exception{
        // Arrange
        String email = "nonexistent@example.com";
        when(userDetailClient.getBasicUserDetails(email)).thenThrow(new RuntimeException("User not found"));

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername(email);
        });

        verify(userDetailClient, times(1)).getBasicUserDetails(email);
    }
  
}
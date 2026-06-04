package service.saml;

import com.adl.et.telco.dte.adminauthmgt.service.saml.CookieService;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;

class CookieServiceTest {
    private CookieService cookieService;

    @BeforeEach
    void setUp(){
        cookieService = new CookieService();
    }

    @Test
    void testCreateCookie_Success(){
        // Arrange
        String cookieValue = "testValue";

        // Act
        Cookie result = assertDoesNotThrow(() -> cookieService.createCookie(cookieValue));

        // Assert
        assertNotNull(result);
        assertEquals("rv_token", result.getName());
        assertEquals(cookieValue, result.getValue());
        // Session cookie: max age must be -1 so the browser discards it when it is closed,
        // forcing the user to log in again on the next browser launch.
        assertEquals(-1, result.getMaxAge());
        assertTrue(result.isHttpOnly());
        assertEquals("/", result.getPath());


    }

}

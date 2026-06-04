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
        // use reflection or a setter to set the value of cookieMaxAge
        setCookieMaxAge(cookieService,3600);

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
        assertEquals(3600, result.getMaxAge());
        assertTrue(result.isHttpOnly());
        assertEquals("/", result.getPath());


    }



    private void setCookieMaxAge(CookieService service, int maxAge){
        try{
            java.lang.reflect.Field field = CookieService.class.getDeclaredField("cookieMaxAge");
            field.setAccessible(true);
            field.set(service,maxAge);
        }catch (NoSuchFieldException | IllegalArgumentException | IllegalAccessException e){
            throw new RuntimeException("Failed to set cookieMaxAge via reflection", e);
        }
    }

}
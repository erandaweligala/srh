package service.impls.auth;

import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import java.lang.reflect.Field;

import jakarta.servlet.http.HttpServletRequest;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    @Mock
    private CacheRepository cacheRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    // Sample secret key and config values
    private final String secretKey = "mySecretKey1234567890";
    private final Long accessTokenExpireTime = 3600000L; // 1 hour
    private final long idleTimeRange = 300L;
    private final long refreshTimeRange = 1800L;
    private final String tempTokenPrefix = "temp_";
    private final String prefixAC = "ac_";



    @BeforeEach
    void setup() throws Exception {
        MockitoAnnotations.openMocks(this);

        setField(jwtService, "secretKey", secretKey);
        setField(jwtService, "accessTokenExpireTime", accessTokenExpireTime);
        setField(jwtService, "idleTimeRange", idleTimeRange);
        setField(jwtService, "refreshTimeRange", refreshTimeRange);
        setField(jwtService, "tempTokenPrefix", tempTokenPrefix);
        setField(jwtService, "prefixAC", prefixAC);
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    private String createTestToken(String subject, Map<String, Object> claims, Long expireTime) {
        try {
            Method method = JwtService.class.getDeclaredMethod("createToken", String.class, Map.class, Long.class);
            method.setAccessible(true);
            return (String) method.invoke(jwtService, subject, claims, expireTime);
        } catch (Exception e) {
            e.printStackTrace(); // Add this line to see the exact issue during runtime
            throw new RuntimeException("Failed to create test token", e);
        }
    }


    @Test
    void extractUsername_shouldReturnCorrectUsername() {
        String username = "user123";
        String token = createTestToken(username, new HashMap<>(), accessTokenExpireTime);
        assertEquals(username, jwtService.extractUsername(token));
    }

    @Test
    void extractExpiration_shouldReturnFutureDate() {
        String token = createTestToken("user", new HashMap<>(), accessTokenExpireTime);
        Date expiration = jwtService.extractExpiration(token);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void tokenExtractor_shouldReturnTokenFromHeader() throws Exception {
        when(httpServletRequest.getHeader("Authorization")).thenReturn("Bearer token123");
        String token = jwtService.tokenExtractor(httpServletRequest);
        assertEquals("token123", token);
    }

    @Test
    void tokenExtractor_shouldReturnEmptyStringIfNoBearer() throws Exception {
        when(httpServletRequest.getHeader("Authorization")).thenReturn("Basic abcdef");
        String token = jwtService.tokenExtractor(httpServletRequest);
        assertEquals("", token);
    }

    @Test
    void extractAuthorities_shouldReturnAuthorities() throws Exception {
        // Build token with permissions JSON structure
        JSONArray actIdsArray = new JSONArray();
        actIdsArray.put(101);
        actIdsArray.put(102);
        JSONObject componentObj = new JSONObject();
        componentObj.put("actions", actIdsArray); // Ensure the key matches ServiceConstants.ACTIDS
        JSONArray components = new JSONArray();
        components.put(componentObj);
        JSONObject permissions = new JSONObject();
        permissions.put("components", components); // Ensure the key matches ServiceConstants.COMPONENTS
        JSONObject claimsJson = new JSONObject();
        claimsJson.put("permissions", permissions); // Ensure the key matches ServiceConstants.PERMISSIONS

        String claimsBase64 = Base64.getEncoder().encodeToString(claimsJson.toString().getBytes(StandardCharsets.UTF_8));

        // Construct fake JWT token with header.payload.signature format, only payload needed here for extractAuthorities
        String token = "header." + claimsBase64 + ".signature";

        var authorities = jwtService.extractAuthorities(token);
        assertEquals(2, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("101")));
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("102")));
    }

    @Test
    void isTokenExpired_shouldReturnFalseForValidToken() {
        String token = createTestToken("user", new HashMap<>(), accessTokenExpireTime);
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void generateAccessToken_shouldAddTokenToMap() throws BaseException {
        Map<String, Object> claims = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();

        jwtService.generateAccessToken("user1", claims, tokenMap);

        assertTrue(tokenMap.containsKey("token"));
        assertNotNull(tokenMap.get("token"));
        assertTrue(tokenMap.get("token").length() > 0);
        assertEquals("access", claims.get(ServiceConstants.T_TYPE));
        assertEquals(idleTimeRange, claims.get(ServiceConstants.IDLE_TIME_RANGE));
        assertEquals(refreshTimeRange, claims.get(ServiceConstants.REFRESH_TIME_RANGE));

    }

    @Test
    void isValidToken_shouldReturnTrueWhenValid() throws BaseException {
        // Arrange
        Map<String, Object> claims = new HashMap<>();
        claims.put(ServiceConstants.T_TYPE, ServiceConstants.ACCESS); // Ensure claim matches expected type
        String token = createTestToken("user1", claims, accessTokenExpireTime);

        when(cacheRepository.existsByUserId("user1")).thenReturn(true);

        // Act
        boolean isValid = jwtService.isValidToken(token);

        // Assert
        assertTrue(isValid, "Token should be valid");
        verify(cacheRepository).updateExpiryTime(prefixAC + "user1", idleTimeRange);
    }


    @Test
    void isValidToken_shouldReturnFalseIfUserNotInCache() throws BaseException {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tType", "access");
        String token = createTestToken("user1", claims, accessTokenExpireTime);

        when(cacheRepository.existsByUserId("user1")).thenReturn(false);

        assertFalse(jwtService.isValidToken(token));
    }


    @Test
    void isValidRequestVerificationToken_shouldReturnTrueWhenMatching() throws Exception {
        // Arrange
        Method method = JwtService.class.getDeclaredMethod("createToken", String.class, Map.class, Long.class);
        method.setAccessible(true);

        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "user1"); // Ensure the claims match the expectations of createToken
        String tempToken = (String) method.invoke(jwtService, "user1", claims, accessTokenExpireTime);

        String expectedRVToken = "rvtoken123";

        when(cacheRepository.existsByKey(tempTokenPrefix + "user1")).thenReturn(true);
        when(cacheRepository.findByKey(tempTokenPrefix + "user1")).thenReturn(expectedRVToken);

        // Act & Assert
        assertTrue(jwtService.isValidRequestVerificationToken(tempToken, expectedRVToken));
    }

    @Test
    void isValidRequestVerificationToken_shouldThrowWhenNoRVToken() {
        // Arrange
        String tempToken = "mockedTempToken";
        when(cacheRepository.existsByKey(tempTokenPrefix + "user1")).thenReturn(false);

        // Act & Assert
        BaseException ex = assertThrows(BaseException.class, () ->
                jwtService.isValidRequestVerificationToken(tempToken, "someToken"));

        // Use the actual exception message temporarily
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }


    @Test
    void extractAuthorities_shouldThrowBaseExceptionOnMalformedToken() {
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.extractAuthorities(badToken));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    @Test
    void extractActions_shouldReturnActions() throws Exception {
        JSONArray actIdsArray = new JSONArray();
        actIdsArray.put(201);
        actIdsArray.put(202);
        JSONObject componentObj = new JSONObject();
        componentObj.put(ServiceConstants.ACTIDS, actIdsArray);
        JSONArray components = new JSONArray();
        components.put(componentObj);
        JSONObject permissions = new JSONObject();
        permissions.put(ServiceConstants.COMPONENTS, components);
        JSONObject claimsJson = new JSONObject();
        claimsJson.put(ServiceConstants.PERMISSIONS, permissions);

        String claimsBase64 = Base64.getEncoder().encodeToString(claimsJson.toString().getBytes(StandardCharsets.UTF_8));
        String token = "header." + claimsBase64 + ".signature";

        List<Long> actions = jwtService.extractActions(token);
        assertEquals(2, actions.size());
        assertTrue(actions.contains(201L));
        assertTrue(actions.contains(202L));
    }

    @Test
    void extractActions_shouldThrowBaseExceptionOnMalformedToken() {
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.extractActions(badToken));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    @Test
    void tokenExtractor_shouldThrowBaseExceptionOnException() {
        when(httpServletRequest.getHeader("Authorization")).thenThrow(new RuntimeException("fail"));
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.tokenExtractor(httpServletRequest));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void generateAccessToken_shouldThrowBaseExceptionOnException() throws Exception {
        setField(jwtService, "secretKey", null); // force createToken to fail
        Map<String, Object> claims = new HashMap<>();
        Map<String, String> tokenMap = new HashMap<>();
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.generateAccessToken("user", claims, tokenMap));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
        setField(jwtService, "secretKey", secretKey); // restore for other tests
    }

    @Test
    void isValidToken_shouldThrowBaseExceptionOnExpiredJwtException() throws Exception {
        // Use a token with expiration in the past
        String token = createTestToken("user1", new HashMap<>(), -1000L);
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidToken(token));
    }

    @Test
    void isValidToken_shouldThrowBaseExceptionOnOtherException() throws Exception {
        // Use a token with invalid structure to cause parsing error
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidToken(badToken));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    @Test
    void isValidTempToken_shouldReturnFalseIfUserIdOrTokenTypeNull() throws Exception {
        // Token with no claims
        String token = createTestToken(null, new HashMap<>(), accessTokenExpireTime);
        assertFalse(jwtService.isValidTempToken(token));
    }

    @Test
    void isValidTempToken_shouldThrowBaseExceptionOnExpiredJwtException() throws Exception {
        String token = createTestToken("user1", new HashMap<>(), -1000L);
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidTempToken(token));
    }

    @Test
    void isValidTempToken_shouldThrowBaseExceptionOnOtherException() {
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidTempToken(badToken));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    @Test
    void isValidRequestVerificationToken_shouldThrowBaseExceptionOnRuntimeException() {
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidRequestVerificationToken(badToken, "rv"));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    @Test
    void isValidRequestVerificationTokenUsingAccessToken_shouldThrowBaseExceptionOnBaseException() throws Exception {
        // Simulate BaseException in cacheRepository.existsByKey
        String token = createTestToken("user1", new HashMap<>(), accessTokenExpireTime);
        when(cacheRepository.existsByKey(prefixAC + "user1")).thenThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null));
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidRequestVerificationTokenUsingAccessToken(token, "rv"));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void isValidRequestVerificationTokenUsingAccessToken_shouldThrowBaseExceptionOnOtherException() {
        String badToken = "bad.token.value";
        BaseException ex = assertThrows(BaseException.class, () -> jwtService.isValidRequestVerificationTokenUsingAccessToken(badToken, "rv"));
        assertEquals("EXCEPTION IN SERVICE LAYER", ex.getReason());
    }

    // Java
    @Test
    void extractClaimWithType_shouldReturnClaimValue() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom", "val123");
        String token = createTestToken("user", claims, accessTokenExpireTime);
        String value = jwtService.extractClaimWithType(token, "custom", String.class);
        assertEquals("val123", value);
    }

    @Test
    void extractClaimWithType_shouldThrowOnMalformedToken() {
        String badToken = "bad.token.value";
        assertThrows(Exception.class, () -> jwtService.extractClaimWithType(badToken, "custom", String.class));
    }

    @Test
    void extractClaim_shouldReturnClaimValue() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("custom", "val456");
        String token = createTestToken("user", claims, accessTokenExpireTime);
        String value = jwtService.extractClaim(token, c -> c.get("custom", String.class));
        assertEquals("val456", value);
    }

    @Test
    void extractClaim_shouldThrowOnMalformedToken() {
        String badToken = "bad.token.value";
        assertThrows(Exception.class, () -> jwtService.extractClaim(badToken, c -> c.get("custom", String.class)));
    }

    @Test
    void isValidRequestVerificationTokenUsingAccessToken_shouldReturnTrue() throws Exception {
        String token = createTestToken("user1", new HashMap<>(), accessTokenExpireTime);
        when(cacheRepository.existsByKey(prefixAC + "user1")).thenReturn(true);
        when(cacheRepository.findByKey(prefixAC + "user1")).thenReturn("rvtoken");
        assertTrue(jwtService.isValidRequestVerificationTokenUsingAccessToken(token, "rvtoken"));
    }







}

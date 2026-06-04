package com.adl.et.telco.dte.adminauthmgt.service.impls.auth;


import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.AuthCodeEnum;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JwtService {
    private static final String LOG_PREFIX = "SRH|JwtService|";

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    @Value("${assisted-channel.secret-key}")
    private String secretKey;

    @Value("${access.token-expire-time-millsec}")
    private Long accessTokenExpireTime;

    @Value("${jwt.idle.time.range.sec}")
    private long idleTimeRange;

    @Value("${jwt.refresh.time.range.sec}")
    private long refreshTimeRange;

    @Value("${prefix.temp}")
    private String tempTokenPrefix;

    @Value("${prefix.ac}")
    private String prefixAC;

    @Autowired
    CacheRepository cacheRepository;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <Y> Y extractClaimWithType(String token, String claimName, Class<Y> returnClass) {
        return extractAllClaims(token).get(claimName, returnClass);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

//    private Claims extractAllClaims(String token) {
//        return Jwts.parser().setSigningKey(secretKey.getBytes()).parseClaimsJws(token).getBody();
//    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String tokenExtractor(HttpServletRequest httpServletRequest) throws BaseException {
        try {
            String jwtToken = "";
            final String authorizationHeader = httpServletRequest.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer")) {
                jwtToken = authorizationHeader.substring(7);
            }
            return jwtToken;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    public List<GrantedAuthority> extractAuthorities(String token) throws BaseException {
        try {
            List<GrantedAuthority> authorities = new ArrayList<>();
            String encodedPayload = token.split("\\.")[1];
            String claimsString = new String(Base64.getDecoder().decode(encodedPayload), StandardCharsets.UTF_8);

            JSONObject claimsJsonObject = new JSONObject(claimsString);
            JSONObject tempJsonObj;
            JSONArray tempJsonArr;
            String authority;

            if (claimsJsonObject.has(ServiceConstants.PERMISSIONS)) {
                JSONObject permissions = ((JSONObject) claimsJsonObject.get(ServiceConstants.PERMISSIONS));

                JSONArray views = (JSONArray) (permissions.get(ServiceConstants.COMPONENTS));
                for (int i = 0; i < views.length(); i++) {
                    tempJsonObj = (JSONObject) views.get(i);
                    tempJsonArr = (JSONArray) tempJsonObj.get(ServiceConstants.ACTIDS);
                    for (int k = 0; k < tempJsonArr.length(); k++) {
                        authority = String.valueOf(tempJsonArr.getInt(k));
                        authorities.add(new SimpleGrantedAuthority(authority));
                    }

                }
            }
            return authorities;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }


    public List<Long> extractActions(String token) throws BaseException {
        try {
            List<Long> actions = new ArrayList<>();
            String encodedPayload = token.split("\\.")[1];
            JSONObject tempJsonObj;
            JSONArray tempJsonArr;
            String authority;
            String claimsString = new String(Base64.getDecoder().decode(encodedPayload), StandardCharsets.UTF_8);

            JSONObject claimsJsonObject = new JSONObject(claimsString);


            if (claimsJsonObject.has(ServiceConstants.PERMISSIONS)) {
                JSONObject permissions = ((JSONObject) claimsJsonObject.get(ServiceConstants.PERMISSIONS));

                JSONArray views = (JSONArray) (permissions.get(ServiceConstants.COMPONENTS));
                for (int i = 0; i < views.length(); i++) {
                    tempJsonObj = (JSONObject) views.get(i);
                    tempJsonArr = (JSONArray) tempJsonObj.get(ServiceConstants.ACTIDS);
                    for (int k = 0; k < tempJsonArr.length(); k++) {
                        authority = String.valueOf(tempJsonArr.getInt(k));
                        actions.add(Long.parseLong(authority));
                    }

                }
            }
            return actions.stream().distinct().collect(Collectors.toList());
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    public void generateAccessToken(String userId, Map<String, Object> claims, Map<String, String> tokenMap) throws BaseException {
        log.debug("{}generateAccessToken|START|Generating access token for user: {}", LOG_PREFIX, userId);
        try {
            claims.put(ServiceConstants.T_TYPE, ServiceConstants.ACCESS);
            claims.put(ServiceConstants.IDLE_TIME_RANGE, idleTimeRange);
            claims.put(ServiceConstants.REFRESH_TIME_RANGE, refreshTimeRange);
            tokenMap.put(ServiceConstants.TOKEN, createToken(userId, claims, accessTokenExpireTime));
            log.debug("{}generateAccessToken|END|Access token generated successfully", LOG_PREFIX);
        } catch (RuntimeException ex) {
            log.error("{}generateAccessToken|ERROR|Error generating access token: {}", LOG_PREFIX, ex.getMessage());
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    private String createToken(String subject, Map<String, Object> claims, Long expireTime) throws BaseException {
        try {
            return Jwts.builder()
                    .setHeaderParam("typ", ServiceConstants.JWT)
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + expireTime))
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception ex) {
            log.error("{}createToken|ERROR|Error creating token: {}", LOG_PREFIX, ex.getMessage());
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        // Pad or truncate to exactly 32 bytes for HS256
        byte[] paddedKey = new byte[32];
        System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
        return Keys.hmacShaKeyFor(paddedKey);
    }

    public boolean isValidToken(String token) throws BaseException {
        log.debug("{}isValidToken|START|Validating token", LOG_PREFIX);
        try {
            boolean isValid = false;
            String userId = extractUsername(token);
            String tokenType = extractClaimWithType(token, ServiceConstants.T_TYPE, String.class);
            logger.info("user id : {}", userId);
            logger.info("tokenType  : {}", tokenType);
            if (userId != null && tokenType != null && !isTokenExpired(token)) {
                isValid = tokenType.equals(ServiceConstants.ACCESS) && cacheRepository.existsByUserId(userId);
                logger.info("is valid token : {}", isValid);
            }
            if (isValid && !tokenType.equals(ServiceConstants.OTP)) {
                cacheRepository.updateExpiryTime(prefixAC + userId, idleTimeRange);
                logger.info("update expiry");
                log.debug("{}isValidToken|INFO|Expiry time updated for cached record with key: {}", LOG_PREFIX, prefixAC + userId);
            }
            log.debug("{}isValidToken|END|Token validation result: {}", LOG_PREFIX, isValid);
            return isValid;

        } catch (ExpiredJwtException ex) {
            log.error("{}isValidToken|ERROR|Token expired: {}", LOG_PREFIX, ex.getMessage());
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.TOKEN_EXPIRED.description(), HttpStatus.FORBIDDEN, ResponseCodeEnum.TOKEN_EXPIRED.code(), ex.getStackTrace());

        } catch (Exception ex) {
            log.error("{}isValidToken|ERROR|Error validating token: {}", LOG_PREFIX, ex.getMessage());
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }

    public boolean isValidTempToken(String token) throws BaseException {
        try {
            boolean isValid = false;
            String userId = extractUsername(token);
            String tokenType = extractClaimWithType(token, ServiceConstants.T_TYPE, String.class);

            if (userId != null && tokenType != null && !isTokenExpired(token)) {
                String receivedUserId = extractClaimWithType(token, ServiceConstants.SUB, String.class);
                return tokenType.equals(ServiceConstants.ACCESS) && cacheRepository.existsByKey(tempTokenPrefix + receivedUserId);
            }
            return isValid;
        } catch (ExpiredJwtException ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.TOKEN_EXPIRED.description(), HttpStatus.FORBIDDEN, ResponseCodeEnum.TOKEN_EXPIRED.code(), ex.getStackTrace());

        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }


    public boolean isValidRequestVerificationToken(String tempToken, String requestVerificationToken) throws BaseException {
        try {
            boolean isValid;
            String existingRVToken = null;

            String userId = extractClaimWithType(tempToken, ServiceConstants.SUB, String.class);

            if (cacheRepository.existsByKey(tempTokenPrefix + userId)) {
                existingRVToken = String.valueOf(cacheRepository.findByKey(tempTokenPrefix + userId));
            }
            if (existingRVToken == null) {
                throw new BaseException(AuthCodeEnum.INVALID_RV_TOKEN.description(), AuthCodeEnum.INVALID_RV_TOKEN.description(), HttpStatus.UNAUTHORIZED, AuthCodeEnum.INVALID_RV_TOKEN.code(), null);
            }
            isValid = (requestVerificationToken != null) && requestVerificationToken.equals(existingRVToken);

            return isValid;

        } catch (RuntimeException ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }


    public boolean isValidRequestVerificationTokenUsingAccessToken(String accessToken, String requestVerificationToken) throws BaseException {
        log.debug("{}isValidRequestVerificationTokenUsingAccessToken|START|Validating request verification token using access token", LOG_PREFIX);
        try {
            boolean isValid;
            String existingRVToken = null;
            String userId = extractUsername(accessToken);

            if (accessToken != null && cacheRepository.existsByKey(prefixAC + userId)) {
                existingRVToken = String.valueOf(cacheRepository.findByKey(prefixAC + userId));
            }
            if (existingRVToken == null) {//loged in and logged out or fake rv token // so invalid user session espires or invalid
                log.error("{}isValidRequestVerificationTokenUsingAccessToken|ERROR|Invalid RV token", LOG_PREFIX);
                throw new BaseException(AuthCodeEnum.INVALID_RV_TOKEN.description(), AuthCodeEnum.INVALID_RV_TOKEN.description(), HttpStatus.UNAUTHORIZED, AuthCodeEnum.INVALID_RV_TOKEN.code(), null);
            }
            isValid = (requestVerificationToken != null) && requestVerificationToken.equals(existingRVToken);

            if (isValid) {
                cacheRepository.updateExpiryTime(prefixAC + userId, idleTimeRange);
                log.debug("{}isValidRequestVerificationTokenUsingAccessToken|INFO|Expiry time updated for cached record with key: {}", LOG_PREFIX, prefixAC + userId);
            }
            return isValid;

        } catch (BaseException e) {
            log.error("{}isValidRequestVerificationTokenUsingAccessToken|ERROR|Base exception: {}", LOG_PREFIX, e.getMessage());
            throw new BaseException(e.getMessage(), e.getReason(), e.getHttpStatus(), e.getResultCode(), null);
        } catch (Exception ex) {
            log.error("{}isValidRequestVerificationTokenUsingAccessToken|ERROR|Error validating request verification token: {}", LOG_PREFIX, ex.getMessage());
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }


}




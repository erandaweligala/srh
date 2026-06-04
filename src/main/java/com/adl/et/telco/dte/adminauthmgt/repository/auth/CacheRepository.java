package com.adl.et.telco.dte.adminauthmgt.repository.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
public class CacheRepository implements RedisRepository {
    private static final Logger logger = LoggerFactory.getLogger(CacheRepository.class);

    @Value("${jwt.idle.time.range.sec}")
    private long timeLimitAC;

    @Value("${prefix.ac}")
    private String prefixAC;

    private final RedisTemplate<String, String> redisTemplate;

    public CacheRepository(@Qualifier("redisTemplateString") RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // ── Internal helper so prefix logic lives in ONE place ──────────────────
    private String buildKey(String userName) {
        // Guard against double-prefixing if callers already include the prefix
        if (userName.startsWith(prefixAC)) {
            return userName;
        }
        return prefixAC + userName;
    }

    @Override
    public void save(String key, String value, Long expiryTimeInSec) {
        // Callers pass a fully-prefixed key (prefixAC + userId or tempTokenPrefix + userId),
        // so store it raw - matching existsByKey/deleteKey. Do NOT force prefixAC here, or
        // temp-token keys get double-prefixed and can never be read back (Invalid Temp Token).
        redisTemplate.opsForValue().set(key, value, expiryTimeInSec, TimeUnit.SECONDS); // atomic set+expire
    }

    @Override
    public String findByKey(String key) {
        // Raw key - callers already include the appropriate prefix (see save()).
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void delete(String userName) {
        String resolvedKey = buildKey(userName);
        Boolean deleted = redisTemplate.delete(resolvedKey);
        // Log outcome so you can confirm deletion during debugging
        logger.info("Cache delete for key '{}': {}", resolvedKey, Boolean.TRUE.equals(deleted) ? "SUCCESS" : "KEY NOT FOUND");
    }

    @Override
    public void deleteKey(String key) {
        Boolean deleted = redisTemplate.delete(key); // raw key, no prefix added
        logger.info("Cache deleteKey '{}': {}", key, Boolean.TRUE.equals(deleted) ? "SUCCESS" : "KEY NOT FOUND");
    }

    @Override
    public boolean existsByUserId(String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(buildKey(userId)));
    }

    @Override
    public boolean existsByKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key)); // raw key
    }

    @Override
    public void updateExpiryTime(String accessToken, Long timeLimitAC) {
        redisTemplate.expire(accessToken, timeLimitAC, TimeUnit.SECONDS);
    }
}

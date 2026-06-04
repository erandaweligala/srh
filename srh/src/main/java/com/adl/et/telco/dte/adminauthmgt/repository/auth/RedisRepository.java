package com.adl.et.telco.dte.adminauthmgt.repository.auth;

public interface RedisRepository {

    void save(String key, String value, Long expiryTimeInSec);

    String findByKey(String key);


    void delete(String userName);

    boolean existsByUserId(String userId);



    void updateExpiryTime(String accessToken, Long timeLimitAC);


    boolean existsByKey(String key);


    void deleteKey(String s);
}

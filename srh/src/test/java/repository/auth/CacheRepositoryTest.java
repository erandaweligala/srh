package repository.auth;

import com.adl.et.telco.dte.adminauthmgt.repository.auth.CacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CacheRepositoryTest {

    private static final String PREFIX_AC = "ADMIN_LOGGEDUSER_inventory_DEV_";
    private static final String PREFIX_TEMP = "ADMIN_TEMPTOKEN_inventory_DEV_";

    @SuppressWarnings("unchecked")
    private final RedisTemplate<String, String> redisTemplate = mock(RedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOps = mock(ValueOperations.class);

    private CacheRepository cacheRepository;

    @BeforeEach
    void setUp() {
        cacheRepository = new CacheRepository(redisTemplate);
        ReflectionTestUtils.setField(cacheRepository, "prefixAC", PREFIX_AC);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    void save_storesTempKeyRaw_withoutForcingAcPrefix() {
        // Regression for "Invalid Temp Token": the temp-token write must land on the
        // exact key the login flow reads back via existsByKey, i.e. tempTokenPrefix + user.
        String tempKey = PREFIX_TEMP + "user1";

        cacheRepository.save(tempKey, "rv-token", 600L);

        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
        verify(valueOps).set(keyCaptor.capture(), eq("rv-token"), eq(600L), eq(TimeUnit.SECONDS));
        assertEquals(tempKey, keyCaptor.getValue());
        assertTrue(keyCaptor.getValue().startsWith(PREFIX_TEMP),
                "temp key must not be re-prefixed with the access prefix");
    }

    @Test
    void save_storesAcKeyRaw_withoutDoublePrefixing() {
        String acKey = PREFIX_AC + "user1";

        cacheRepository.save(acKey, "rv-token", 1200L);

        verify(valueOps).set(eq(acKey), eq("rv-token"), eq(1200L), eq(TimeUnit.SECONDS));
    }

    @Test
    void findByKey_readsRawKey() {
        String tempKey = PREFIX_TEMP + "user1";
        when(valueOps.get(tempKey)).thenReturn("rv-token");

        assertEquals("rv-token", cacheRepository.findByKey(tempKey));
        verify(valueOps).get(tempKey);
    }

    @Test
    void existsByUserId_appliesAcPrefixToBareUserId() {
        when(redisTemplate.hasKey(any())).thenReturn(true);

        assertTrue(cacheRepository.existsByUserId("user1"));
        verify(redisTemplate).hasKey(PREFIX_AC + "user1");
    }
}

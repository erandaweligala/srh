package service.impls.common;


import com.adl.et.telco.dte.adminauthmgt.repository.route.Actions;
import com.adl.et.telco.dte.adminauthmgt.repository.route.ActionsRepository;
import com.adl.et.telco.dte.adminauthmgt.repository.route.RouteInfo;
import com.adl.et.telco.dte.adminauthmgt.repository.route.RouteInfoRepository;
import com.adl.et.telco.dte.adminauthmgt.service.impls.common.MicroServiceURLFetchService;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MicroServiceURLFetchServiceTest {

    @Mock
    private RouteInfoRepository repository;

    @Mock
    private ActionsRepository actionsRepository;

    @InjectMocks
    private MicroServiceURLFetchService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCheckAndReturnURL_Success() {
        String uri = "/api/v1/resource/123";
        List<Long> actions = Arrays.asList(1L, 2L);

        RouteInfo routeInfo = new RouteInfo();
        routeInfo.setInPath("/api/v1/resource");
        routeInfo.setOutURL("http://microservice/resource");
        routeInfo.setIsPathVariableAvailable(true);
        routeInfo.setActionIds(3L);

        Actions action = new Actions();
        action.setName("READ");
        routeInfo.setActions(Arrays.asList(action));

        when(repository.findByActionIds(actions)).thenReturn(Arrays.asList(routeInfo));
        when(actionsRepository.findById(routeInfo.getActionIds())).thenReturn(Optional.empty());

        Map<String, String> result = service.checkAndReturnURL(uri, actions);

        assertNotNull(result);
        assertEquals("http://microservice/resource/123", result.get(AdminAuthConstant.MSURL));
        assertEquals("READ", result.get(AdminAuthConstant.ACTIONS));

        verify(repository, times(1)).findByActionIds(actions);
    }

    @Test
    void testCheckAndReturnURL_Forbidden() {
        String uri = "/api/v1/resource/123";
        List<Long> actions = Arrays.asList(1L, 2L);

        when(repository.findByActionIds(actions)).thenReturn(new ArrayList<>());

        HttpClientErrorException exception = assertThrows(HttpClientErrorException.class, () -> {
            service.checkAndReturnURL(uri, actions);
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());

        verify(repository, times(1)).findByActionIds(actions);
    }
}



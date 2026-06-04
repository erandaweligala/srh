//package service.impls.ums;
//
//import com.adl.et.telco.dte.adminauthmgt.client.ums.UserActivityLogClient;
//import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
//import com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto;
//import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.FilterValue;
//import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
//import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLog;
//import com.adl.et.telco.dte.adminauthmgt.repository.audit.ActionLogRepository;
//import com.adl.et.telco.dte.adminauthmgt.repository.route.RouteInfoRepository;
//import com.adl.et.telco.dte.adminauthmgt.service.impls.ums.UserActivityLogServiceImpl;
//import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
//import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
//import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.jpa.domain.Specification;
//import org.springframework.http.HttpStatus;
//
//import java.time.LocalDateTime;
//import java.util.*;
//
//import static com.adl.et.telco.dte.adminauthmgt.util.access.AuthLoggingConstants.PROCESSING;
//import static com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum.EMPTY_RESPONSE;
//import static com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum.SUCCESSFUL;
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class UserActivityLogServiceImplTest {
//
//    @Mock
//    private UserActivityLogClient userActivityLogClient;
//
//    @Mock
//    private RouteInfoRepository routeInfoRepository;
//
//    @Mock
//    private ResponseHandler handler;
//
//    @Mock
//    private ActionLogRepository actionLogRepository;
//
//    @InjectMocks
//    private UserActivityLogServiceImpl userActivityLogService;
//
//    private TableFilterRequest tableFilterRequest;
//    private ActionLog actionLog;
//
//    @BeforeEach
//    void setUp() {
//        tableFilterRequest = new TableFilterRequest();
//        tableFilterRequest.setOffset(0);
//        tableFilterRequest.setLimit(10);
//        tableFilterRequest.setFilterValues(new ArrayList<>());
//
//        actionLog = ActionLog.builder()
//                .id(1L)
//                .activity("TEST_ACTIVITY")
//                .activityId("ACT_123")
//                .url("/test/url")
//                .status(PROCESSING)
//                .statusDescription("Request Processing")
//                .user("testUser")
//                .isUpdate(false)
//                .createdAt(LocalDateTime.now())
//                .updatedAt(LocalDateTime.now())
//                .build();
//    }
//
//    @Test
//    void testLogUserActivity_Success() {
//        // Arrange
//        String activity = "LOGIN";
//        String activityId = "ACT_001";
//        String detailedRequest = "User login request";
//        String url = "/api/login";
//        String user = "testUser";
//
//        when(actionLogRepository.save(any(ActionLog.class))).thenReturn(actionLog);
//
//        // Act
//        userActivityLogService.logUserActivity(activity, activityId, detailedRequest, url, user);
//
//        // Assert
//        verify(actionLogRepository, times(1)).save(argThat(log ->
//                log.getActivity().equals(activity) &&
//                        log.getActivityId().equals(activityId) &&
//                        log.getUrl().equals(url) &&
//                        log.getStatus().equals(PROCESSING) &&
//                        log.getStatusDescription().equals("Request Processing") &&
//                        log.getUser().equals(user) &&
//                        !log.isUpdate() &&
//                        log.getCreatedAt() != null &&
//                        log.getUpdatedAt() != null
//        ));
//    }
//
//    @Test
//    void testLogUserActivity_ExceptionHandling() {
//        // Arrange
//        String activity = "LOGIN";
//        String activityId = "ACT_001";
//        String detailedRequest = "User login request";
//        String url = "/api/login";
//        String user = "testUser";
//
//        when(actionLogRepository.save(any(ActionLog.class)))
//                .thenThrow(new RuntimeException("Database error"));
//
//        // Act - should not throw exception due to try-catch
//        assertDoesNotThrow(() ->
//                userActivityLogService.logUserActivity(activity, activityId, detailedRequest, url, user)
//        );
//
//        // Assert
//        verify(actionLogRepository, times(1)).save(any(ActionLog.class));
//    }
//
//    @Test
//    void testLogUserActivity_WithNullValues() {
//        // Arrange
//        when(actionLogRepository.save(any(ActionLog.class))).thenReturn(actionLog);
//
//        // Act
//        userActivityLogService.logUserActivity(null, null, null, null, null);
//
//        // Assert
//        verify(actionLogRepository, times(1)).save(argThat(log ->
//                log.getActivity() == null &&
//                        log.getActivityId() == null &&
//                        log.getUrl() == null &&
//                        log.getUser() == null
//        ));
//    }
//
//    @Test
//    void testUpdateStatus_Success() {
//        // Arrange
//        String activityId = "ACT_001";
//        String status = "SUCCESS";
//        String statusDescription = "Completed successfully";
//
//        when(actionLogRepository.updateStatus(eq(activityId), eq(status), eq(statusDescription),
//                any(LocalDateTime.class), eq(Boolean.TRUE))).thenReturn(1);
//
//        // Act
//        userActivityLogService.updateStatus(activityId, status, statusDescription);
//
//        // Assert
//        verify(actionLogRepository, times(1)).updateStatus(
//                eq(activityId),
//                eq(status),
//                eq(statusDescription),
//                any(LocalDateTime.class),
//                eq(Boolean.TRUE)
//        );
//    }
//
//    @Test
//    void testUpdateStatus_NoRecordsUpdated() {
//        // Arrange
//        String activityId = "ACT_001";
//        String status = "SUCCESS";
//        String statusDescription = "Completed successfully";
//
//        when(actionLogRepository.updateStatus(eq(activityId), eq(status), eq(statusDescription),
//                any(LocalDateTime.class), eq(Boolean.TRUE))).thenReturn(0);
//
//        // Act
//        userActivityLogService.updateStatus(activityId, status, statusDescription);
//
//        // Assert
//        verify(actionLogRepository, times(1)).updateStatus(
//                eq(activityId),
//                eq(status),
//                eq(statusDescription),
//                any(LocalDateTime.class),
//                eq(Boolean.TRUE)
//        );
//    }
//
//    @Test
//    void testUpdateStatus_MultipleRecordsUpdated() {
//        // Arrange
//        String activityId = "ACT_001";
//        String status = "SUCCESS";
//        String statusDescription = "Completed successfully";
//
//        when(actionLogRepository.updateStatus(eq(activityId), eq(status), eq(statusDescription),
//                any(LocalDateTime.class), eq(Boolean.TRUE))).thenReturn(5);
//
//        // Act
//        userActivityLogService.updateStatus(activityId, status, statusDescription);
//
//        // Assert
//        verify(actionLogRepository, times(1)).updateStatus(
//                eq(activityId),
//                eq(status),
//                eq(statusDescription),
//                any(LocalDateTime.class),
//                eq(Boolean.TRUE)
//        );
//    }
//
//    @Test
//    void testUpdateStatus_ExceptionHandling() {
//        // Arrange
//        String activityId = "ACT_001";
//        String status = "SUCCESS";
//        String statusDescription = "Completed successfully";
//
//        when(actionLogRepository.updateStatus(anyString(), anyString(), anyString(),
//                any(LocalDateTime.class), anyBoolean()))
//                .thenThrow(new RuntimeException("Database error"));
//
//        // Act - should not throw exception due to try-catch
//        assertDoesNotThrow(() ->
//                userActivityLogService.updateStatus(activityId, status, statusDescription)
//        );
//
//        // Assert
//        verify(actionLogRepository, times(1)).updateStatus(
//                anyString(),
//                anyString(),
//                anyString(),
//                any(LocalDateTime.class),
//                anyBoolean()
//        );
//    }
//
//    @Test
//    void testGetActionLog_Success() {
//        // Arrange
//        List<ActionLog> actionLogs = Arrays.asList(actionLog);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 1);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//        expectedResponse.setData(actionLogs);
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//        verify(handler, times(1)).responseBuilderWithPageInformation(
//                eq(actionLogs),
//                eq(SUCCESSFUL.description()),
//                eq(SUCCESSFUL.code()),
//                argThat(page ->
//                        page.getPageNumber() == 0 &&
//                                page.getPageElementCount() == 10 &&
//                                page.getTotalRecords() == 1L
//                )
//        );
//    }
//
//    @Test
//    void testGetActionLog_WithFilterValues() {
//        // Arrange
//        FilterValue filterValue = FilterValue.builder()
//                .columnName("status")
//                .operation("equals")
//                .value(new String[]{"SUCCESS"})
//                .build();
//
//        tableFilterRequest.setFilterValues(Arrays.asList(filterValue));
//
//        List<ActionLog> actionLogs = Arrays.asList(actionLog);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 1);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//    }
//
//    @Test
//    void testGetActionLog_BaseException() {
//        // Arrange
//        BaseException baseException = new BaseException(
//                "Test error",
//                "Error reason",
//                HttpStatus.BAD_REQUEST,
//                "400",
//                new StackTraceElement[0]
//        );
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenThrow(baseException);
//
//        // Act & Assert
//        BaseException thrown = assertThrows(BaseException.class, () ->
//                userActivityLogService.getActionLog(tableFilterRequest)
//        );
//
//        assertEquals("Test error", thrown.getMessage());
//        assertEquals("Error reason", thrown.getReason());
//        assertEquals(HttpStatus.BAD_REQUEST, thrown.getHttpStatus());
//        assertEquals("400", thrown.getResultCode());
//    }
//
//    @Test
//    void testGetActionLog_GenericException() {
//        // Arrange
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenThrow(new RuntimeException("Database error"));
//
//        // Act & Assert
//        BaseException thrown = assertThrows(BaseException.class, () ->
//                userActivityLogService.getActionLog(tableFilterRequest)
//        );
//
//        assertEquals("Database error", thrown.getMessage());
//        assertEquals(DisplayResultCodeEnum.GET_USER_ACTIVITY_LOG_FAILED.description(), thrown.getReason());
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrown.getHttpStatus());
//        assertEquals(DisplayResultCodeEnum.GET_USER_ACTIVITY_LOG_FAILED.code(), thrown.getResultCode());
//    }
//
//    @Test
//    void testGetActionLogById_Success() {
//        // Arrange
//        String id = "1";
//        CommonNorthBoundResponse<ActionLog> expectedResponse = new CommonNorthBoundResponse<>();
//        expectedResponse.setData(actionLog);
//
//        when(actionLogRepository.findById(1L)).thenReturn(Optional.of(actionLog));
//        when(handler.responseBuilder(any(ActionLog.class), anyString(), anyString()))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<ActionLog> result = userActivityLogService.getActionLogById(id);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findById(1L);
//        verify(handler, times(1)).responseBuilder(
//                eq(actionLog),
//                eq(SUCCESSFUL.description()),
//                eq(SUCCESSFUL.code())
//        );
//    }
//
//    @Test
//    void testGetActionLogById_NotFound() {
//        // Arrange
//        String id = "999";
//        CommonNorthBoundResponse<ActionLog> expectedResponse = new CommonNorthBoundResponse<>();
//        expectedResponse.setData(new ActionLog());
//
//        when(actionLogRepository.findById(999L)).thenReturn(Optional.empty());
//        when(handler.responseBuilder(any(ActionLog.class), anyString(), anyString()))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<ActionLog> result = userActivityLogService.getActionLogById(id);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findById(999L);
//        verify(handler, times(1)).responseBuilder(
//                any(ActionLog.class),
//                eq(EMPTY_RESPONSE.description()),
//                eq(EMPTY_RESPONSE.code())
//        );
//    }
//
//    @Test
//    void testGetActionLogById_NumberFormatException() {
//        // Arrange
//        String id = "invalid_id";
//
//        // Act & Assert
//        BaseException thrown = assertThrows(BaseException.class, () ->
//                userActivityLogService.getActionLogById(id)
//        );
//
//        assertTrue(thrown.getMessage().contains("For input string"));
//        assertEquals(DisplayResultCodeEnum.GET_ACTIVITY_FAILED.description(), thrown.getReason());
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrown.getHttpStatus());
//        assertEquals(DisplayResultCodeEnum.GET_ACTIVITY_FAILED.code(), thrown.getResultCode());
//    }
//
//    @Test
//    void testGetActionLogById_NumberFormatException_NonNumericString() {
//        // Arrange
//        String id = "abc123";
//
//        // Act & Assert
//        BaseException thrown = assertThrows(BaseException.class, () ->
//                userActivityLogService.getActionLogById(id)
//        );
//
//        assertEquals(DisplayResultCodeEnum.GET_ACTIVITY_FAILED.description(), thrown.getReason());
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrown.getHttpStatus());
//    }
//
//    @Test
//    void testGetActionLogById_GenericException() {
//        // Arrange
//        String id = "1";
//
//        when(actionLogRepository.findById(1L))
//                .thenThrow(new RuntimeException("Database error"));
//
//        // Act & Assert
//        BaseException thrown = assertThrows(BaseException.class, () ->
//                userActivityLogService.getActionLogById(id)
//        );
//
//        assertEquals("Database error", thrown.getMessage());
//        assertEquals(DisplayResultCodeEnum.GET_ACTIVITY_FAILED.description(), thrown.getReason());
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrown.getHttpStatus());
//        assertEquals(DisplayResultCodeEnum.GET_ACTIVITY_FAILED.code(), thrown.getResultCode());
//    }
//
//    @Test
//    void testGetActionLog_WithEmptyFilterValues() {
//        // Arrange
//        tableFilterRequest.setFilterValues(Collections.emptyList());
//        List<ActionLog> actionLogs = Arrays.asList(actionLog);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 1);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//    }
//
//    @Test
//    void testGetActionLog_WithNullFilterValues() {
//        // Arrange
//        tableFilterRequest.setFilterValues(null);
//        List<ActionLog> actionLogs = Arrays.asList(actionLog);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 1);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//    }
//
//    @Test
//    void testGetActionLog_WithMultipleResults() {
//        // Arrange
//        ActionLog actionLog2 = ActionLog.builder()
//                .id(2L)
//                .activity("LOGOUT")
//                .activityId("ACT_124")
//                .url("/test/url2")
//                .status("SUCCESS")
//                .statusDescription("Completed")
//                .user("testUser2")
//                .isUpdate(true)
//                .createdAt(LocalDateTime.now())
//                .updatedAt(LocalDateTime.now())
//                .build();
//
//        List<ActionLog> actionLogs = Arrays.asList(actionLog, actionLog2);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 2);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//        verify(handler, times(1)).responseBuilderWithPageInformation(
//                eq(actionLogs),
//                eq(SUCCESSFUL.description()),
//                eq(SUCCESSFUL.code()),
//                argThat(page -> page.getTotalRecords() == 2L)
//        );
//    }
//
//    @Test
//    void testGetActionLog_WithDifferentPageSize() {
//        // Arrange
//        tableFilterRequest.setOffset(1);
//        tableFilterRequest.setLimit(20);
//
//        List<ActionLog> actionLogs = Arrays.asList(actionLog);
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(1, 20), 21);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(
//                any(Specification.class),
//                argThat(pageRequest ->
//                        pageRequest.getPageNumber() == 1 &&
//                                pageRequest.getPageSize() == 20
//                )
//        );
//    }
//
//    @Test
//    void testGetActionLog_EmptyResults() {
//        // Arrange
//        List<ActionLog> actionLogs = Collections.emptyList();
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(0, 10), 0);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//        verify(handler, times(1)).responseBuilderWithPageInformation(
//                eq(actionLogs),
//                eq(SUCCESSFUL.description()),
//                eq(SUCCESSFUL.code()),
//                argThat(page -> page.getTotalRecords() == 0L)
//        );
//    }
//
//    @Test
//    void testGetActionLogById_WithLargeId() {
//        // Arrange
//        String id = "999999999";
//        CommonNorthBoundResponse<ActionLog> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findById(999999999L)).thenReturn(Optional.empty());
//        when(handler.responseBuilder(any(ActionLog.class), anyString(), anyString()))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<ActionLog> result = userActivityLogService.getActionLogById(id);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findById(999999999L);
//    }
//
//    @Test
//    void testGetActionLogById_WithZeroId() {
//        // Arrange
//        String id = "0";
//        CommonNorthBoundResponse<ActionLog> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findById(0L)).thenReturn(Optional.empty());
//        when(handler.responseBuilder(any(ActionLog.class), anyString(), anyString()))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<ActionLog> result = userActivityLogService.getActionLogById(id);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findById(0L);
//        verify(handler, times(1)).responseBuilder(
//                any(ActionLog.class),
//                eq(EMPTY_RESPONSE.description()),
//                eq(EMPTY_RESPONSE.code())
//        );
//    }
//
//    @Test
//    void testGetActionLog_WithLargePageOffset() {
//        // Arrange
//        tableFilterRequest.setOffset(1000);
//        tableFilterRequest.setLimit(10);
//
//        List<ActionLog> actionLogs = Collections.emptyList();
//        Page<ActionLog> actionLogPage = new PageImpl<>(actionLogs, PageRequest.of(1000, 10), 5000);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(
//                any(Specification.class),
//                argThat(pageRequest -> pageRequest.getPageNumber() == 1000)
//        );
//    }
//
//    @Test
//    void testUpdateStatus_WithNullValues() {
//        // Arrange
//        when(actionLogRepository.updateStatus(isNull(), isNull(), isNull(),
//                any(LocalDateTime.class), eq(Boolean.TRUE))).thenReturn(0);
//
//        // Act
//        userActivityLogService.updateStatus(null, null, null);
//
//        // Assert
//        verify(actionLogRepository, times(1)).updateStatus(
//                isNull(),
//                isNull(),
//                isNull(),
//                any(LocalDateTime.class),
//                eq(Boolean.TRUE)
//        );
//    }
//
//    @Test
//    void testGetActionLog_RepositoryReturnsNullContent() {
//        // Arrange
//        Page<ActionLog> actionLogPage = new PageImpl<>(new ArrayList<>(), PageRequest.of(0, 10), 0);
//
//        CommonNorthBoundResponse<List<ActionLog>> expectedResponse = new CommonNorthBoundResponse<>();
//
//        when(actionLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
//                .thenReturn(actionLogPage);
//        when(handler.responseBuilderWithPageInformation(anyList(), anyString(), anyString(), any(PageDetailDto.class)))
//                .thenReturn(expectedResponse);
//
//        // Act
//        CommonNorthBoundResponse<List<ActionLog>> result = userActivityLogService.getActionLog(tableFilterRequest);
//
//        // Assert
//        assertNotNull(result);
//        verify(actionLogRepository, times(1)).findAll(any(Specification.class), any(PageRequest.class));
//    }
//}
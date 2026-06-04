package service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.client.ums.RoleManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.CreateNewRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleDetails;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleView;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.UpdateRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.FilterValue;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.ums.RoleManagementServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.ActionLogMsgCreator;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;


class RoleManagementServiceImplTest {

    @Mock
    private RoleManagementClient roleManagementClient;

    @Mock
    private ResponseHandler handler;

    @Mock
    private UserActivityLogInterface userActivityLogInterface;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private RoleManagementServiceImpl roleManagementService;

    @Mock
    private ActionLogMsgCreator actionLogMsgCreator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRoleList_Success() throws BaseException {
        // Arrange
        // Set MDC trace id so it doesn't return null
        MDC.put(AdminAuthConstant.TRACE_ID, "mockTraceId");

        // Mock HttpServletRequest methods
        when(httpServletRequest.getRequestURI()).thenReturn("/mock/uri");

        List<RoleView> mockRoleList = new ArrayList<>();
        mockRoleList.add(new RoleView());

        CommonSouthBoundResponse<List<RoleView>> mockResponse = new CommonSouthBoundResponse<>();
        mockResponse.setResponseData(mockRoleList);

        Result mockResult = new Result();
        mockResult.setResultCode("00");
        mockResult.setResultDescription("Success");
        mockResult.setPageDetail(new PageDetailDto());
        mockResponse.setResult(mockResult);

        when(roleManagementClient.getRoleList(anyInt(), anyInt(), anyString())).thenReturn(mockResponse);
        when(handler.responseBuilderWithPageInformation(eq(mockRoleList), eq("Success"), eq("00"), any()))
                .thenReturn(new CommonNorthBoundResponse<>());

        when(jwtService.tokenExtractor(any())).thenReturn("mockToken");
        when(jwtService.extractUsername(anyString())).thenReturn("mockUsername");

        doNothing().when(userActivityLogInterface).logUserActivity(anyString(), anyString(), anyString(), anyString(), anyString(),anyInt(),anyString());
        doNothing().when(userActivityLogInterface).updateStatus(anyString(), anyString(), anyString());

        // Act
        CommonNorthBoundResponse<List<RoleView>> response = roleManagementService.getRoleList(10, 0, "roleName", httpServletRequest);

        // Assert
        assertNotNull(response);
        verify(roleManagementClient, times(1)).getRoleList(anyInt(), anyInt(), anyString());
        verify(handler, times(1)).responseBuilderWithPageInformation(eq(mockRoleList), eq("Success"), eq("00"), any());
        verify(jwtService, times(1)).tokenExtractor(any());
        verify(jwtService, times(1)).extractUsername(anyString());
        verify(userActivityLogInterface, times(1)).logUserActivity("View user Roles List", "mockTraceId", "Role name: roleName", "/mock/uri", "mockUsername",null,"View");

        // Clear MDC after test to avoid side effects
        MDC.clear();
    }

    @Test
    void testGetRoleMetaData_Success() {
        // Arrange
        List<MetaData> mockMetaDataList = new ArrayList<>();
        mockMetaDataList.add(new MetaData());

        CommonSouthBoundResponse<List<MetaData>> mockResponse = new CommonSouthBoundResponse<>();
        mockResponse.setResponseData(mockMetaDataList);

        Result mockResult = new Result();
        mockResult.setResultCode("SUCCESS");
        mockResult.setResultDescription("Success");
        mockResponse.setResult(mockResult);

        when(roleManagementClient.getRoleMetaData()).thenReturn(mockResponse);
        when(handler.responseBuilder(any(), anyString(), anyString()))
                .thenReturn(new CommonNorthBoundResponse<>());

        // Act
        CommonNorthBoundResponse<List<MetaData>> response = roleManagementService.getRoleMetaData();

        // Assert
        assertNotNull(response);
        verify(roleManagementClient, times(1)).getRoleMetaData();
        verify(handler, times(1)).responseBuilder(
                eq(mockMetaDataList),
                eq("Success"),
                eq("SUCCESS"));
    }


    @Test
    void testGetFilteredRoleList_Success() throws BaseException {
        // Arrange

        // Create a mock FilterValue list (instead of List<String>)
        List<FilterValue> mockFilterValues = new ArrayList<>();
        FilterValue filterValue = new FilterValue();
        // Optionally set properties of filterValue here if needed
        mockFilterValues.add(filterValue);

        TableFilterRequest mockRequest = mock(TableFilterRequest.class);
        when(mockRequest.getFilterValues()).thenReturn(mockFilterValues);
        when(mockRequest.getFilterValues()).thenReturn(mockFilterValues);  // mock getFilterValues call

        List<RoleView> mockRoleList = new ArrayList<>();
        mockRoleList.add(new RoleView());

        CommonSouthBoundResponse<List<RoleView>> mockResponse = new CommonSouthBoundResponse<>();
        mockResponse.setResponseData(mockRoleList);

        Result mockResult = new Result();
        mockResult.setResultCode("200");
        mockResult.setResultDescription("Success");
        mockResult.setPageDetail(null);
        mockResponse.setResult(mockResult);

        // Mock the roleManagementClient call
        when(roleManagementClient.getFilteredRoleList(mockRequest)).thenReturn(mockResponse);

        // Mock the actionLogMsgCreator call with the correct FilterValue list type
        when(actionLogMsgCreator.createMsgForFilterUserList(mockFilterValues)).thenReturn("filter log message");

        // Mock jwtService to extract username from tokenExtractor
        when(jwtService.tokenExtractor(any())).thenReturn("dummyJwtToken");
        when(jwtService.extractUsername("dummyJwtToken")).thenReturn("mockUsername");

        // Mock httpServletRequest.getRequestURI()
        when(httpServletRequest.getRequestURI()).thenReturn("/some/uri");

        // Mock handler.responseBuilderWithPageInformation call
        when(handler.responseBuilderWithPageInformation(
                eq(mockRoleList),
                eq("Success"),
                eq("200"),
                eq(null)
        )).thenReturn(new CommonNorthBoundResponse<>());

        // Act
        CommonNorthBoundResponse<List<RoleView>> response = roleManagementService.getFilteredRoleList(mockRequest, httpServletRequest);

        // Assert
        assertNotNull(response);

        verify(userActivityLogInterface, times(1)).logUserActivity(
                eq("View user Roles List"),
                any(),
                eq("filter log message"),
                eq("/some/uri"),
                eq("mockUsername"),
                eq(null),
                eq("View")
        );
        verify(roleManagementClient, times(1)).getFilteredRoleList(mockRequest);
        verify(userActivityLogInterface, times(1)).updateStatus(any(), eq(ServiceConstants.SUCCESS), eq(ServiceConstants.SUCCESS_DESCRIPTION));
        verify(handler, times(1)).responseBuilderWithPageInformation(any(), anyString(), anyString(), any());


    }

    @Test
    void testGetRoleDetails_Success() {
        // Set the MDC key expected in the service
        MDC.put(AdminAuthConstant.TRACE_ID, "mockTraceId");

        // Arrange
        String roleId = "role123";
        String token = "mockToken";
        String username = "mockUser";

        RoleDetails roleDetails = new RoleDetails();
        CommonSouthBoundResponse<RoleDetails> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResponseData(roleDetails);
        southBoundResponse.setResult(new Result());
        southBoundResponse.getResult().setResultCode("200");
        southBoundResponse.getResult().setResultDescription("Success");

        when(httpServletRequest.getRequestURI()).thenReturn("/roles/details");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractUsername(token)).thenReturn(username);
        when(roleManagementClient.getRoleDetails(roleId)).thenReturn(southBoundResponse);
        when(handler.responseBuilder(any(), anyString(), anyString())).thenReturn(new CommonNorthBoundResponse<>());


        // Act
        CommonNorthBoundResponse<RoleDetails> response = roleManagementService.getRoleDetails(roleId, httpServletRequest);

        // Assert
        assertNotNull(response);
        verify(userActivityLogInterface).logUserActivity(eq("Retrieve User Role By Id"), eq("mockTraceId"), eq("Role id: " + roleId), eq("/roles/details"), eq(username),
                eq(null),
                eq("View"));
        verify(userActivityLogInterface).updateStatus(eq("mockTraceId"), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(roleManagementClient).getRoleDetails(roleId);
        verify(handler).responseBuilder(roleDetails, "Success", "200");

        // Clean up MDC to avoid test pollution
        MDC.clear();
    }

    @Test
    void testCreateRole_Success() {
        // Set the MDC key expected in the service
        MDC.put(AdminAuthConstant.TRACE_ID, "mockTraceId");

        // Arrange
        CreateNewRole createNewRoleRequest = new CreateNewRole();
        createNewRoleRequest.setRoleName("Admin");
        createNewRoleRequest.setDescription("Administrator role");

        String token = "mockToken";
        String username = "mockUser";

        CommonSouthBoundResponse<String> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResponseData(null);
        southBoundResponse.setResult(new Result());
        southBoundResponse.getResult().setResultCode("200");
        southBoundResponse.getResult().setResultDescription("Role created successfully");

        when(httpServletRequest.getRequestURI()).thenReturn("/roles/create");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractUsername(token)).thenReturn(username);
        when(roleManagementClient.createRole(createNewRoleRequest)).thenReturn(southBoundResponse);
        when(handler.responseBuilder(null, "Role created successfully", "200"))
                .thenReturn(new CommonNorthBoundResponse<>());

        // Act
        CommonNorthBoundResponse<String> response = roleManagementService.createRole(createNewRoleRequest, httpServletRequest);

        // Assert
        assertNotNull(response);
        verify(userActivityLogInterface).logUserActivity(eq("Create new User Role"), eq("mockTraceId"), eq(createNewRoleRequest.toString()), eq("/roles/create"), eq(username),
                eq(null),
                eq("Add"));
        verify(userActivityLogInterface).updateStatus(eq("mockTraceId"), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(roleManagementClient).createRole(createNewRoleRequest);
        verify(handler).responseBuilder(null, "Role created successfully", "200");

        // Clean up MDC to avoid test pollution
        MDC.clear();
    }

    @Test
    void updateRole_Success() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        UpdateRole updateRoleRequest = new UpdateRole();
        String token = "mockToken";
        String username = "mockUser";

        CommonSouthBoundResponse<String> southResponse = new CommonSouthBoundResponse<>();
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Role updated successfully");
        southResponse.setResult(result);

        when(httpServletRequest.getRequestURI()).thenReturn("/roles/update");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(token);
        when(jwtService.extractUsername(token)).thenReturn(username);
        when(roleManagementClient.updateRole(updateRoleRequest)).thenReturn(southResponse);
        when(handler.responseBuilder(null, "Role updated successfully", "200"))
                .thenReturn(new CommonNorthBoundResponse<>());

        CommonNorthBoundResponse<String> response = roleManagementService.updateRole(updateRoleRequest, httpServletRequest);

        assertNotNull(response);
        verify(userActivityLogInterface).logUserActivity("Update User Role", "traceId", updateRoleRequest.toString(), "/roles/update", username,null,"Update");
        verify(userActivityLogInterface).updateStatus("traceId", ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
        verify(roleManagementClient).updateRole(updateRoleRequest);
        verify(handler).responseBuilder(null, "Role updated successfully", "200");
        MDC.clear();
    }



    // --- getRoleList ---
    @Test
    void testGetRoleList_BaseException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        when(httpServletRequest.getRequestURI()).thenReturn("/mock/uri");
        when(jwtService.tokenExtractor(any())).thenReturn("token");
        when(jwtService.extractUsername(anyString())).thenReturn("user");
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(roleManagementClient).getRoleList(anyInt(), anyInt(), anyString());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getRoleList(1, 2, "role", httpServletRequest));
        assertEquals("fail", ex.getMessage());
        MDC.clear();
    }

    @Test
    void testGetRoleList_GenericException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        when(httpServletRequest.getRequestURI()).thenReturn("/mock/uri");
        when(jwtService.tokenExtractor(any())).thenReturn("token");
        when(jwtService.extractUsername(anyString())).thenReturn("user");
        doThrow(new RuntimeException("fail"))
                .when(roleManagementClient).getRoleList(anyInt(), anyInt(), anyString());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getRoleList(1, 2, "role", httpServletRequest));
        assertEquals("GET_ROLE_LIST_FAILED", ex.getReason());
        MDC.clear();
    }

    // --- getRoleDetails ---
    @Test
    void testGetRoleDetails_BaseException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(roleManagementClient).getRoleDetails(anyString());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getRoleDetails("id", httpServletRequest));
        assertEquals("fail", ex.getMessage());
        MDC.clear();
    }

    @Test
    void testGetRoleDetails_GenericException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new RuntimeException("fail"))
                .when(roleManagementClient).getRoleDetails(anyString());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getRoleDetails("id", httpServletRequest));
        assertEquals("GET_ROLE_DETAILS_FAILED", ex.getReason());
        MDC.clear();
    }

    // --- createRole ---
    @Test
    void testCreateRole_BaseException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        CreateNewRole req = new CreateNewRole();
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(roleManagementClient).createRole(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.createRole(req, httpServletRequest));
        assertEquals("fail", ex.getMessage());
        MDC.clear();
    }

    @Test
    void testCreateRole_GenericException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        CreateNewRole req = new CreateNewRole();
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new RuntimeException("fail"))
                .when(roleManagementClient).createRole(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.createRole(req, httpServletRequest));
        assertEquals("CREATE_ROLE_FAILED", ex.getReason());
        MDC.clear();
    }

    // --- updateRole ---
    @Test
    void testUpdateRole_BaseException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        UpdateRole req = new UpdateRole();
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(roleManagementClient).updateRole(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.updateRole(req, httpServletRequest));
        assertEquals("fail", ex.getMessage());
        MDC.clear();
    }

    @Test
    void testUpdateRole_GenericException() {
        MDC.put(AdminAuthConstant.TRACE_ID, "traceId");
        UpdateRole req = new UpdateRole();
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        doThrow(new RuntimeException("fail"))
                .when(roleManagementClient).updateRole(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.updateRole(req, httpServletRequest));
        assertEquals("UPDATE_ROLE_FAILED", ex.getReason());
        MDC.clear();
    }

    // --- getFilteredRoleList ---
    @Test
    void testGetFilteredRoleList_BaseException() {
        TableFilterRequest req = mock(TableFilterRequest.class);
        when(req.getFilterValues()).thenReturn(List.of());
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForFilterUserList(any())).thenReturn("msg");
        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(roleManagementClient).getFilteredRoleList(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getFilteredRoleList(req, httpServletRequest));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void testGetFilteredRoleList_GenericException() {
        TableFilterRequest req = mock(TableFilterRequest.class);
        when(req.getFilterValues()).thenReturn(List.of());
        when(httpServletRequest.getRequestURI()).thenReturn("/uri");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForFilterUserList(any())).thenReturn("msg");
        doThrow(new RuntimeException("fail"))
                .when(roleManagementClient).getFilteredRoleList(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                roleManagementService.getFilteredRoleList(req, httpServletRequest));
        assertEquals("GET_ROLE_LIST_FAILED", ex.getReason());
    }


}
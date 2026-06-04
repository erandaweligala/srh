// File: src/test/java/com/adl/et/telco/dte/adminauthmgt/service/impls/ums/PermissionManagemenServiceImplTest.java
package service.impls.ums;

import com.adl.et.telco.dte.adminauthmgt.client.ums.PermissionManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto;
import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents.MenuComponents;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.FilterValue;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.ums.PermissionManagemenServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.ActionLogMsgCreator;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PermissionManagemenServiceImplTest {

    @Mock
    private PermissionManagementClient permissionManagementClient;
    @Mock
    private ResponseHandler handler;

    @InjectMocks
    private PermissionManagemenServiceImpl service;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserActivityLogInterface userActivityLogInterface;

    @Mock
    private ActionLogMsgCreator actionLogMsgCreator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getActionHierarchy_ReturnsExpectedResponse() {
        String componentId = "comp123";
        AllActions allActions = new AllActions();
        CommonSouthBoundResponse<AllActions> southResponse = new CommonSouthBoundResponse<>();
        southResponse.setResponseData(allActions);
        var result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        CommonNorthBoundResponse<AllActions> expected = new CommonNorthBoundResponse<>();
        when(permissionManagementClient.getActionHierarchy(componentId)).thenReturn(southResponse);
        when(handler.responseBuilder(allActions, "Success", "200")).thenReturn(expected);

        CommonNorthBoundResponse<AllActions> actual = service.getActionHierarchy(componentId);

        assertSame(expected, actual);
        verify(permissionManagementClient).getActionHierarchy(componentId);
        verify(handler).responseBuilder(allActions, "Success", "200");
    }

    @Test
    void getAllMenuAndComponents_ReturnsExpectedResponse() throws Exception {
        List<MenuComponents> menuList = List.of(new MenuComponents());
        CommonSouthBoundResponse<List<MenuComponents>> southResponse = new CommonSouthBoundResponse<>();
        southResponse.setResponseData(menuList);
        var result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        CommonNorthBoundResponse<List<MenuComponents>> expected = new CommonNorthBoundResponse<>();
        when(permissionManagementClient.getAllMenuAndComponents()).thenReturn(southResponse);
        when(handler.responseBuilder(menuList, "Success", "200")).thenReturn(expected);

        CommonNorthBoundResponse<List<MenuComponents>> actual = service.getAllMenuAndComponents();

        assertSame(expected, actual);
        verify(permissionManagementClient).getAllMenuAndComponents();
        verify(handler).responseBuilder(menuList, "Success", "200");
    }


    @Test
    void getPermissionMetaData_ReturnsExpectedResponse() throws Exception {
        List<PermissionMetaData> metaDataList = List.of(new PermissionMetaData());
        CommonSouthBoundResponse<List<PermissionMetaData>> southResponse = new CommonSouthBoundResponse<>();
        southResponse.setResponseData(metaDataList);
        var result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        CommonNorthBoundResponse<List<PermissionMetaData>> expected = new CommonNorthBoundResponse<>();
        when(permissionManagementClient.getPermissionMetaData()).thenReturn(southResponse);
        when(handler.responseBuilder(metaDataList, "Success", "200")).thenReturn(expected);

        CommonNorthBoundResponse<List<PermissionMetaData>> actual = service.getPermissionMetaData();

        assertSame(expected, actual);
        verify(permissionManagementClient).getPermissionMetaData();
        verify(handler).responseBuilder(metaDataList, "Success", "200");
    }

    @Test
    void editPermission_ReturnsExpectedResponse() throws Exception {
        EditPermission editPermission = new EditPermission(
                "id", "name", "type", "value", "description", "createdBy", List.of(1L, 2L), List.of(1L, 2L)
        );
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/edit");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        CommonSouthBoundResponse<String> southResponse = new CommonSouthBoundResponse<>();
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        when(permissionManagementClient.editPermission(editPermission)).thenReturn(southResponse);

        CommonNorthBoundResponse<String> expected = new CommonNorthBoundResponse<>();
        when(handler.responseBuilder((String) null, "Success", "200")).thenReturn(expected);

        CommonNorthBoundResponse<String> actual = service.editPermission(editPermission, request);

        assertSame(expected, actual);
        verify(userActivityLogInterface).logUserActivity(
                eq("Update Permission"),
                any(),
                anyString(),
                eq("/api/permission/edit"),
                eq("user"),
                eq(null),
                eq("Update")
        );
        verify(permissionManagementClient).editPermission(editPermission);
        verify(userActivityLogInterface).updateStatus(any(), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(handler).responseBuilder(null, "Success", "200");
    }

    @Test
    void createPermission_ReturnsExpectedResponse() throws Exception {
        // Arrange
        CreatePermission createPermission = new CreatePermission(
                "id", "name", "type", "value", "description",  List.of(1L, 2L), List.of(1L, 2L)
        );
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/create");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        CommonSouthBoundResponse<String> southResponse = new CommonSouthBoundResponse<>();
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        when(permissionManagementClient.createPermission(createPermission)).thenReturn(southResponse);

        CommonNorthBoundResponse<String> expected = new CommonNorthBoundResponse<>();
        when(handler.responseBuilder((String) null, "Success", "200")).thenReturn(expected);


        // Act
        CommonNorthBoundResponse<String> actual = service.createPermission(createPermission, request);

        // Assert
        assertSame(expected, actual);
        verify(userActivityLogInterface).logUserActivity(
                eq("Create Permission"),
                any(),
                anyString(),
                eq("/api/permission/create"),
                eq("user"),
                eq(null),
                eq("Add")
        );
        verify(permissionManagementClient).createPermission(createPermission);
        verify(userActivityLogInterface).updateStatus(any(), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(handler).responseBuilder(null, "Success", "200");
    }

    @Test
    void getPermissionDetails_ReturnsExpectedResponse() throws Exception {
        // Arrange
        String permissionId = "perm123";
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/details");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        PermissionDetails permissionDetails = new PermissionDetails();
        CommonSouthBoundResponse<PermissionDetails> southResponse = new CommonSouthBoundResponse<>();
        southResponse.setResponseData(permissionDetails);
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        when(permissionManagementClient.getPermissionDetails(permissionId)).thenReturn(southResponse);

        CommonNorthBoundResponse<PermissionDetails> expected = new CommonNorthBoundResponse<>();
        when(handler.responseBuilder(permissionDetails, "Success", "200")).thenReturn(expected);

        // Act
        CommonNorthBoundResponse<PermissionDetails> actual = service.getPermissionDetails(permissionId, request);

        // Assert
        assertSame(expected, actual);
        verify(userActivityLogInterface).logUserActivity(
                eq("View Permission Full Details"),
                any(),
                eq("PermissionId: " + permissionId),
                eq("/api/permission/details"),
                eq("user"),
                eq(null),
                eq("View")
        );
        verify(permissionManagementClient).getPermissionDetails(permissionId);
        verify(userActivityLogInterface).updateStatus(any(), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(handler).responseBuilder(permissionDetails, "Success", "200");
    }

    @Test
    void getFilteredPermissionList_ReturnsExpectedResponse() {
        // Arrange
        TableFilterRequest filterRequest = mock(TableFilterRequest.class);
        when(filterRequest.getFilterValues()).thenReturn(List.of(new FilterValue(), new FilterValue()));
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/filter");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForFilterUserList(any())).thenReturn("filterMsg");

        List<PermissionView> permissionViews = List.of(new PermissionView());
        CommonSouthBoundResponse<List<PermissionView>> southResponse = new CommonSouthBoundResponse<>();
        southResponse.setResponseData(permissionViews);
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        southResponse.setResult(result);

        // Mock page detail if needed
        PageDetailDto pageDetail = new PageDetailDto();
        result.setPageDetail(pageDetail);

        when(permissionManagementClient.getFilteredPermissionList(filterRequest)).thenReturn(southResponse);

        CommonNorthBoundResponse<List<PermissionView>> expected = new CommonNorthBoundResponse<>();
        when(handler.responseBuilderWithPageInformation(permissionViews, "Success", "200", pageDetail)).thenReturn(expected);

        // Act
        CommonNorthBoundResponse<List<PermissionView>> actual = service.getFilteredPermissionList(filterRequest, request);

        // Assert
        assertSame(expected, actual);
        verify(userActivityLogInterface).logUserActivity(
                eq("View All Permissions"),
                any(),
                eq("filterMsg"),
                eq("/api/permission/filter"),
                eq("user"),
                eq(null),
                eq("Filter")
        );
        verify(permissionManagementClient).getFilteredPermissionList(filterRequest);
        verify(userActivityLogInterface).updateStatus(any(), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(handler).responseBuilderWithPageInformation(permissionViews, "Success", "200", pageDetail);
    }

    @Test
    void getPermissionList_ReturnsExpectedResponse() throws Exception {
        // Arrange
        String permissionName = "perm";
        String menuId = "menu1";
        String sectionId = "sec1";
        String limit = "10";
        String offset = "0";
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/list");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForGetPermission(permissionName, menuId, sectionId)).thenReturn("getPermMsg");

        List<PermissionView> permissionViews = List.of(new PermissionView());
        CommonSouthBoundResponse<List<PermissionView>> southResponse = new CommonSouthBoundResponse<>();
        Result result = new Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        PageDetailDto pageDetail = new PageDetailDto();
        result.setPageDetail(pageDetail);
        southResponse.setResult(result);
        southResponse.setResponseData(permissionViews);

        when(permissionManagementClient.getPermissionList(permissionName, menuId, sectionId, limit, offset)).thenReturn(southResponse);

        CommonNorthBoundResponse<List<PermissionView>> expected = new CommonNorthBoundResponse<>();
        when(handler.responseBuilderWithPageInformation(permissionViews, "Success", "200", pageDetail)).thenReturn(expected);

        // Act
        CommonNorthBoundResponse<List<PermissionView>> actual = service.getPermissionList(permissionName, menuId, sectionId, limit, offset, request);

        // Assert
        assertSame(expected, actual);
        verify(userActivityLogInterface).logUserActivity(
                eq("View All Permissions"),
                any(),
                eq("getPermMsg"),
                eq("/api/permission/list"),
                eq("user"),
                eq(null),
                eq("View")
        );
        verify(permissionManagementClient).getPermissionList(permissionName, menuId, sectionId, limit, offset);
        verify(userActivityLogInterface).updateStatus(any(), eq("SUCCESS"), eq("Successfully executed operation"));
        verify(handler).responseBuilderWithPageInformation(permissionViews, "Success", "200", pageDetail);
    }

    @Test
    void getPermissionList_ThrowsBaseException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/list");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForGetPermission(any(), any(), any())).thenReturn("msg");

        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(permissionManagementClient)
                .getPermissionList(any(), any(), any(), any(), any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getPermissionList("a", "b", "c", "d", "e", request));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void getPermissionList_ThrowsGenericException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/list");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForGetPermission(any(), any(), any())).thenReturn("msg");

        doThrow(new RuntimeException("fail"))
                .when(permissionManagementClient)
                .getPermissionList(any(), any(), any(), any(), any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getPermissionList("a", "b", "c", "d", "e", request));
        assertEquals("GET_PERMISSION_DETAILS_FAILED", ex.getReason());
    }

    @Test
    void getFilteredPermissionList_ThrowsBaseException() {
        TableFilterRequest filterRequest = mock(TableFilterRequest.class);
        when(filterRequest.getFilterValues()).thenReturn(List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/filter");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForFilterUserList(any())).thenReturn("msg");

        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(permissionManagementClient)
                .getFilteredPermissionList(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getFilteredPermissionList(filterRequest, request));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void getFilteredPermissionList_ThrowsGenericException() {
        TableFilterRequest filterRequest = mock(TableFilterRequest.class);
        when(filterRequest.getFilterValues()).thenReturn(List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/filter");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");
        when(actionLogMsgCreator.createMsgForFilterUserList(any())).thenReturn("msg");

        doThrow(new RuntimeException("fail"))
                .when(permissionManagementClient)
                .getFilteredPermissionList(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getFilteredPermissionList(filterRequest, request));
        assertEquals("GET_PERMISSION_DETAILS_FAILED", ex.getReason());
    }

    @Test
    void getPermissionDetails_ThrowsBaseException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/details");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(permissionManagementClient)
                .getPermissionDetails(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getPermissionDetails("id", request));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void getPermissionDetails_ThrowsGenericException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/details");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new RuntimeException("fail"))
                .when(permissionManagementClient)
                .getPermissionDetails(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.getPermissionDetails("id", request));
        assertEquals("GET_PERMISSION_DETAILS_FAILED", ex.getReason());
    }

    @Test
    void createPermission_ThrowsBaseException() {
        CreatePermission createPermission = new CreatePermission("id", "name", "type", "value", "desc", List.of(), List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/create");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(permissionManagementClient)
                .createPermission(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.createPermission(createPermission, request));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void createPermission_ThrowsGenericException() {
        CreatePermission createPermission = new CreatePermission("id", "name", "type", "value", "desc", List.of(), List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/create");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new RuntimeException("fail"))
                .when(permissionManagementClient)
                .createPermission(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.createPermission(createPermission, request));
        assertEquals("CREATE_PERMISSION_FAILED", ex.getReason());
    }

    @Test
    void editPermission_ThrowsBaseException() {
        EditPermission editPermission = new EditPermission("id", "name", "type", "value", "desc", "createdBy", List.of(), List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/edit");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "code", null))
                .when(permissionManagementClient)
                .editPermission(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.editPermission(editPermission, request));
        assertEquals("fail", ex.getMessage());
    }

    @Test
    void editPermission_ThrowsGenericException() {
        EditPermission editPermission = new EditPermission("id", "name", "type", "value", "desc", "createdBy", List.of(), List.of());
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/permission/edit");
        when(jwtService.tokenExtractor(request)).thenReturn("token");
        when(jwtService.extractUsername("token")).thenReturn("user");

        doThrow(new RuntimeException("fail"))
                .when(permissionManagementClient)
                .editPermission(any());

        BaseException ex = assertThrows(BaseException.class, () ->
                service.editPermission(editPermission, request));
        assertEquals("EDIT_PERMISSION_FAILED", ex.getReason());
    }
}
package service.impls.ums;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.adl.et.telco.dte.adminauthmgt.client.ums.UserManagementClient;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;

import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.*;
import com.adl.et.telco.dte.adminauthmgt.service.impls.auth.JwtService;
import com.adl.et.telco.dte.adminauthmgt.service.impls.ums.UserManagementServiceImpl;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserActivityLogInterface;
import com.adl.et.telco.dte.adminauthmgt.util.ActionLogMsgCreator;
import com.adl.et.telco.dte.adminauthmgt.util.ResponseHandler;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;
import com.adl.et.telco.dte.adminauthmgt.util.constants.ServiceConstants;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.DisplayResultCodeEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

class UserManagementServiceImplTest {

    @InjectMocks
    private UserManagementServiceImpl userManagementService;

    @Mock
    private UserManagementClient userManagementClient;

    @Mock
    private ResponseHandler handler;

    @Mock
    private UserActivityLogInterface userActivityLogInterface;

    @Mock
    private JwtService jwtService;

    @Mock
    private ActionLogMsgCreator actionLogMsgCreator;

    @Mock
    private HttpServletRequest httpServletRequest;

    private static final String USER_ID = "test-user-id";
    private static final String TRACE_ID = "test-trace-id";
    private static final String TOKEN = "test-token";

    private UserDetails userDetails;
    private CommonSouthBoundResponse<UserDetails> clientResponse;

    @Captor
    private ArgumentCaptor<String> traceIdCaptor;

    private final String jwtToken = "mockJwtToken";
    private final String username = "adminUser";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        MDC.put(AdminAuthConstant.TRACE_ID, TRACE_ID);

        userDetails = new UserDetails();
        userDetails.setUserId(USER_ID);

        clientResponse = new CommonSouthBoundResponse<>();
        clientResponse.setResponseData(userDetails);

        when(httpServletRequest.getRequestURI()).thenReturn("/api/user/details");
        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(TOKEN);
        when(jwtService.extractUsername(TOKEN)).thenReturn("testUser");
    }

    @Test
    void testGetUserDetails_Success() {
        // Setup mock response
        Result result = new Result();
        result.setResultCode(ServiceConstants.SUCCESS);
        result.setResultDescription(ServiceConstants.SUCCESS_DESCRIPTION);

        CommonSouthBoundResponse<UserDetails> clientResponse = new CommonSouthBoundResponse<>();
        clientResponse.setResult(result);

        UserDetails userDetails = new UserDetails();
        userDetails.setUserId(USER_ID);
        clientResponse.setResponseData(userDetails);

        // Mock behavior
        when(userManagementClient.getUserDetails(USER_ID)).thenReturn(clientResponse);

        CommonNorthBoundResponse<UserDetails> expectedResponse = new CommonNorthBoundResponse<>();
        expectedResponse.setCode(ServiceConstants.SUCCESS);
        expectedResponse.setData(userDetails); // Assuming 'setData()' is the setter
        when(handler.responseBuilder(
                userDetails,
                ServiceConstants.SUCCESS_DESCRIPTION,
                ServiceConstants.SUCCESS)
        ).thenReturn(expectedResponse);

        // Call the method under test
        CommonNorthBoundResponse<UserDetails> actualResponse = userManagementService.getUserDetails(USER_ID, httpServletRequest);

        // Assertions
        assertNotNull(actualResponse);
        assertEquals(ServiceConstants.SUCCESS, actualResponse.getCode());
        assertEquals(USER_ID, actualResponse.getData().getUserId()); // Use correct accessor

        // Verify interactions
        verify(userActivityLogInterface).logUserActivity(
                "Retrieve User Details",
                TRACE_ID,
                "User ID :" + USER_ID,
                "/api/user/details",
                "testUser",
                null,
                "Filter"
        );
        verify(userActivityLogInterface).updateStatus(TRACE_ID, ServiceConstants.SUCCESS, ServiceConstants.SUCCESS_DESCRIPTION);
    }



    @Test
    void testGetUserDetails_BaseException() {
        // Prepare the exception to throw
        BaseException baseException = new BaseException(
                "User not found",
                DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.description(),
                HttpStatus.NOT_FOUND,
                DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.code(),
                null
        );

        // Mock the client behavior
        when(userManagementClient.getUserDetails(eq(USER_ID))).thenThrow(baseException);

        // Assert that the exception is thrown
        BaseException exception = assertThrows(BaseException.class, () -> {
            userManagementService.getUserDetails(USER_ID, httpServletRequest);
        });

        // Additional assertions to verify the exception details
        assertEquals("User not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getHttpStatus());
        assertEquals(DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.code(), exception.getResultCode());
    }




    @Test
    void testGetUserDetails_GenericException() {
        RuntimeException runtimeException = new RuntimeException("Unexpected error");
        when(userManagementClient.getUserDetails(USER_ID)).thenThrow(runtimeException);

        BaseException exception = assertThrows(BaseException.class, () -> {
            userManagementService.getUserDetails(USER_ID, httpServletRequest);
        });

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getHttpStatus());
        assertEquals(DisplayResultCodeEnum.GET_USER_DETAILS_FAILED.description(), exception.getReason());
        verify(userActivityLogInterface).updateStatus(TRACE_ID, ServiceConstants.FAILED_CAPITAL, "Unexpected error");
    }

    @Test
    void createUser_BaseException() {
        // Mock data
        CreateUserRequest newUser = new CreateUserRequest();
        newUser.setName("testUser");

        BaseException baseException = new BaseException(
                "User creation failed",
                "Validation Error",
                HttpStatus.BAD_REQUEST,
                "ERROR_CODE",
                null
        );

        // Mock JWT extraction and client response
        when(jwtService.tokenExtractor(any(HttpServletRequest.class))).thenReturn("jwtToken");
        when(jwtService.extractUsername(eq("jwtToken"))).thenReturn("adminUser");

        // Mock throwing exception when client method is called
        doThrow(baseException).when(userManagementClient).createUser(eq(newUser));

        // Expect exception
        BaseException thrown = assertThrows(
                BaseException.class,
                () -> userManagementService.createUser(newUser, httpServletRequest)
        );

        // Assertions
        assertEquals("User creation failed", thrown.getMessage());
        assertEquals("ERROR_CODE", thrown.getResultCode());
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getHttpStatus());

        verify(userActivityLogInterface).logUserActivity(
                eq("Create User"),
                anyString(),
                eq(newUser.toString()),
                anyString(),
                eq("adminUser"),
                eq(null),
                eq("Add")
        );
        verify(userActivityLogInterface).updateStatus(anyString(), eq(ServiceConstants.FAILED_CAPITAL), eq("User creation failed"));
    }


    @Test
    void createUser_GenericException() {
        // Mock data
        CreateUserRequest newUser = new CreateUserRequest();
        newUser.setName("testUser");

        // Mock JWT extraction and client response
        when(jwtService.tokenExtractor(any(HttpServletRequest.class))).thenReturn("jwtToken");
        when(jwtService.extractUsername(eq("jwtToken"))).thenReturn("adminUser");

        doThrow(new RuntimeException("Unexpected error")).when(userManagementClient).createUser(eq(newUser));

        // Expect exception
        BaseException thrown = assertThrows(
                BaseException.class,
                () -> userManagementService.createUser(newUser, httpServletRequest)
        );

        // Assertions
        assertEquals(DisplayResultCodeEnum.CREATE_USER_FAILED.description(), thrown.getMessage());
        assertEquals(DisplayResultCodeEnum.CREATE_USER_FAILED.code(), thrown.getResultCode());
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, thrown.getHttpStatus());

        verify(userActivityLogInterface).logUserActivity(
                eq("Create User"),
                anyString(),
                eq(newUser.toString()),
                anyString(),
                eq("adminUser"),
                eq(null),
                eq("Add")
        );
        verify(userActivityLogInterface).updateStatus(anyString(), eq(ServiceConstants.FAILED_CAPITAL), eq("Unexpected error"));
    }

    @Test
    void editUser_Success() {
        // Arrange
        EditUserRequest user = new EditUserRequest();
        user.setUserId("123");
        user.setName("Test User");

        CommonSouthBoundResponse<String> clientResponse = new CommonSouthBoundResponse<>();
        Result result = new Result();
        result.setResultCode(ServiceConstants.SUCCESS);
        result.setResultDescription(ServiceConstants.SUCCESS_DESCRIPTION);
        clientResponse.setResult(result);

        CommonNorthBoundResponse<String> expectedResponse = new CommonNorthBoundResponse<>();
        expectedResponse.setData(null);

        when(jwtService.tokenExtractor(any(HttpServletRequest.class))).thenReturn(jwtToken);
        when(jwtService.extractUsername(anyString())).thenReturn(username);
        when(userManagementClient.editUser(any(EditUserRequest.class))).thenReturn(clientResponse);
        when(handler.<String>responseBuilder(
                null,
                ServiceConstants.SUCCESS_DESCRIPTION,
                ServiceConstants.SUCCESS)
        ).thenReturn(expectedResponse);
        CommonNorthBoundResponse<String> actualResponse = userManagementService.editUser(user, httpServletRequest);

        // Assert
        assertNotNull(actualResponse);
        assertNull(actualResponse.getData());

        verify(userActivityLogInterface).updateStatus(
                anyString(),
                eq(ServiceConstants.SUCCESS),
                eq(ServiceConstants.SUCCESS_DESCRIPTION)
        );
        verify(handler).responseBuilder(
                isNull(),
                eq(ServiceConstants.SUCCESS_DESCRIPTION),
                eq(ServiceConstants.SUCCESS)
        );
    }




    @Test
    void editUser_Failure_BaseException() {
        // Arrange
        EditUserRequest user = new EditUserRequest();
        user.setUserId("123");
        user.setName("Test User");

        BaseException exception = new BaseException(
                "Failed to edit user",
                "BaseException occurred",
                HttpStatus.BAD_REQUEST,
                "400",
                null
        );

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(jwtToken);
        when(jwtService.extractUsername(jwtToken)).thenReturn(username);
        when(userManagementClient.editUser(user)).thenThrow(exception);

        // Act & Assert
        BaseException thrown = assertThrows(BaseException.class, () -> userManagementService.editUser(user, httpServletRequest));
        assertEquals("Failed to edit user", thrown.getMessage());
        verify(userActivityLogInterface).updateStatus(
                anyString(),
                eq(ServiceConstants.FAILED_CAPITAL),
                eq("Failed to edit user")
        );
    }

    @Test
    void editUser_Failure_Exception() {
        // Arrange
        EditUserRequest user = new EditUserRequest();
        user.setUserId("123");
        user.setName("Test User");

        Exception exception = new RuntimeException("Unexpected error");

        when(jwtService.tokenExtractor(httpServletRequest)).thenReturn(jwtToken);
        when(jwtService.extractUsername(jwtToken)).thenReturn(username);
        when(userManagementClient.editUser(user)).thenThrow(exception);

        // Act & Assert
        BaseException thrown = assertThrows(BaseException.class, () -> userManagementService.editUser(user, httpServletRequest));
        assertEquals("EDIT_USER_FAILED", thrown.getMessage());
        verify(userActivityLogInterface).updateStatus(
                anyString(),
                eq(ServiceConstants.FAILED_CAPITAL),
                eq("Unexpected error")
        );
    }



    @Test
    void testGetAllUsers_Success() {
        // Arrange
        String limit = "10";
        String offset = "0";
        String userName = "testUser";
        String roleId = "1";
        String statusId = "1";
        String traceId = "trace-123";
        String mockedToken = "mockedToken";
        String mockedUser = "mockedUser";
        String logMsg = "Log message";

        MDC.put(AdminAuthConstant.TRACE_ID, traceId);

        List<AllUserDetails> userDetailsList = new ArrayList<>();
        AllUserDetails userDetails = new AllUserDetails();
        userDetails.setName(userName);
        userDetailsList.add(userDetails);

        com.adl.et.telco.dte.adminauthmgt.dto.common.Result result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto pageDetail = new com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto();
        pageDetail.setTotalRecords(1);
        result.setPageDetail(pageDetail);

        CommonSouthBoundResponse<List<AllUserDetails>> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResult(result);
        southBoundResponse.setResponseData(userDetailsList);

        CommonNorthBoundResponse<List<AllUserDetails>> expectedResponse = new CommonNorthBoundResponse<>();
        expectedResponse.setData(userDetailsList);

        when(jwtService.tokenExtractor(any(HttpServletRequest.class))).thenReturn(mockedToken);
        when(jwtService.extractUsername(mockedToken)).thenReturn(mockedUser);
        when(actionLogMsgCreator.createMsgForGetUserList(userName, roleId, statusId, null)).thenReturn(logMsg);
        when(userManagementClient.getAllUsers(limit, offset, userName, roleId, statusId)).thenReturn(southBoundResponse);
        when(handler.responseBuilderWithPageInformation(
                eq(userDetailsList),
                eq("Success"),
                eq("200"),
                eq(pageDetail)
        )).thenReturn(expectedResponse);
        when(httpServletRequest.getRequestURI()).thenReturn("/api/users");

        // Act
        CommonNorthBoundResponse<List<AllUserDetails>> actualResponse = userManagementService.getAllUsers(
                limit, offset, userName, roleId, statusId, httpServletRequest);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(userDetailsList, actualResponse.getData());

        verify(userActivityLogInterface).logUserActivity(
                eq("View User List"),
                eq(traceId),
                eq(logMsg),
                eq("/api/users"),
                eq(mockedUser),
                eq(null),
                eq("Filter")
        );
        verify(userActivityLogInterface).updateStatus(
                eq(traceId),
                eq(ServiceConstants.SUCCESS),
                eq(ServiceConstants.SUCCESS_DESCRIPTION)
        );
        verify(handler).responseBuilderWithPageInformation(
                eq(userDetailsList),
                eq("Success"),
                eq("200"),
                eq(pageDetail)
        );
    }


    @Test
    void testGetAllFilteredUserList_Success() {
        // Arrange
        TableFilterRequest filterRequest = new TableFilterRequest();
        FilterValue filterValue = new FilterValue();
        filterValue.setColumnName("role");
        filterValue.setOperation("admin");
        List<FilterValue> filterValues = List.of(filterValue);

        String traceId = "trace-456";
        String mockedToken = "mockedToken";
        String mockedUser = "mockedUser";
        String logMsg = "Filter log message";

        MDC.put(AdminAuthConstant.TRACE_ID, traceId);

        List<AllUserDetails> userDetailsList = new ArrayList<>();
        AllUserDetails userDetails = new AllUserDetails();
        userDetails.setName("admin");
        userDetailsList.add(userDetails);

        com.adl.et.telco.dte.adminauthmgt.dto.common.Result result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultCode("200");
        result.setResultDescription("Success");
        com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto pageDetail = new com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto();
        pageDetail.setTotalRecords(1);
        result.setPageDetail(pageDetail);

        CommonSouthBoundResponse<List<AllUserDetails>> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResult(result);
        southBoundResponse.setResponseData(userDetailsList);

        CommonNorthBoundResponse<List<AllUserDetails>> expectedResponse = new CommonNorthBoundResponse<>();
        expectedResponse.setData(userDetailsList);

        when(jwtService.tokenExtractor(any(HttpServletRequest.class))).thenReturn(mockedToken);
        when(jwtService.extractUsername(mockedToken)).thenReturn(mockedUser);
        when(actionLogMsgCreator.createMsgForFilterUserList(filterValues)).thenReturn(logMsg);
        when(userManagementClient.getAllFilteredUserList(filterRequest)).thenReturn(southBoundResponse);
        when(handler.responseBuilderWithPageInformation(
                eq(userDetailsList),
                eq("Success"),
                eq("200"),
                eq(pageDetail)
        )).thenReturn(expectedResponse);
        when(httpServletRequest.getRequestURI()).thenReturn("/api/users/filter");

        // Act
        CommonNorthBoundResponse<List<AllUserDetails>> actualResponse = userManagementService.getAllFilteredUserList(
                filterRequest, httpServletRequest);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(userDetailsList, actualResponse.getData());

        
        verify(userActivityLogInterface).updateStatus(
                eq(traceId),
                eq(ServiceConstants.SUCCESS),
                eq(ServiceConstants.SUCCESS_DESCRIPTION)
        );
        verify(handler).responseBuilderWithPageInformation(
                eq(userDetailsList),
                eq("Success"),
                eq("200"),
                eq(pageDetail)
        );
    }

    @Test
    void testGetAllFilteredUserList_BaseException() throws Exception {
        // Arrange
        TableFilterRequest tableFilterRequest = new TableFilterRequest();
        HttpServletRequest httpServletRequest = mock(HttpServletRequest.class);

        BaseException baseException = new BaseException("Error message", "REASON", HttpStatus.BAD_REQUEST, "CODE", null);
        when(userManagementClient.getAllFilteredUserList(tableFilterRequest)).thenThrow(baseException);

        // Act & Assert
        BaseException exception = assertThrows(BaseException.class, () ->
                userManagementService.getAllFilteredUserList(tableFilterRequest, httpServletRequest)
        );
        assertEquals("Error message", exception.getMessage());
        verify(userActivityLogInterface, times(1)).updateStatus(anyString(), eq(ServiceConstants.FAILED_CAPITAL), eq("Error message"));
    }

    @Test
    void testGetAllFilteredUserList_GenericException() throws Exception {
        // Arrange
        TableFilterRequest tableFilterRequest = new TableFilterRequest();
        HttpServletRequest httpServletRequest = mock(HttpServletRequest.class);

        when(userManagementClient.getAllFilteredUserList(tableFilterRequest)).thenThrow(new RuntimeException("Runtime exception"));

        // Act & Assert
        BaseException exception = assertThrows(BaseException.class, () ->
                userManagementService.getAllFilteredUserList(tableFilterRequest, httpServletRequest)
        );
        assertEquals(DisplayResultCodeEnum.GET_ALL_USER_FAILED.description(), exception.getMessage());
        verify(userActivityLogInterface, times(1)).updateStatus(anyString(), eq(ServiceConstants.FAILED_CAPITAL), eq("Runtime exception"));
    }


    @Test
    void testValidateEmail_Success() {
        // Arrange
        String email = "test@example.com";
        HttpServletRequest request = mock(HttpServletRequest.class);

        EmailValidateResponse emailValidateResponse = new EmailValidateResponse();
        CommonSouthBoundResponse<EmailValidateResponse> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResponseData(emailValidateResponse);
        southBoundResponse.setResult(new com.adl.et.telco.dte.adminauthmgt.dto.common.Result());
        southBoundResponse.getResult().setResultDescription("Success");
        southBoundResponse.getResult().setResultCode("200");

        CommonNorthBoundResponse<EmailValidateResponse> northBoundResponse = new CommonNorthBoundResponse<>();
        northBoundResponse.setData(emailValidateResponse);

        when(userManagementClient.validateEmail(any())).thenReturn(southBoundResponse);
        when(handler.responseBuilder(emailValidateResponse, "Success", "200")).thenReturn(northBoundResponse);

        // Act
        CommonNorthBoundResponse<EmailValidateResponse> result = userManagementService.validateEmail(new EmailValidationRequest(), request);

        // Assert
        assertNotNull(result);
        assertEquals(emailValidateResponse, result.getData());
        verify(handler, times(1)).responseBuilder(emailValidateResponse, "Success", "200");
    }

    @Test
    void testGetUserStatusMetaData_Success() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        List<MetaData> metaDataList = new ArrayList<>();
        MetaData metaData = new MetaData();
        metaData.setLabel("status");
        metaData.setValue("active");
        metaDataList.add(metaData);

        CommonSouthBoundResponse<List<MetaData>> southBoundResponse = new CommonSouthBoundResponse<>();
        southBoundResponse.setResponseData(metaDataList);
        com.adl.et.telco.dte.adminauthmgt.dto.common.Result result = new com.adl.et.telco.dte.adminauthmgt.dto.common.Result();
        result.setResultDescription("Success");
        result.setResultCode("200");
        southBoundResponse.setResult(result);

        CommonNorthBoundResponse<List<MetaData>> northBoundResponse = new CommonNorthBoundResponse<>();
        northBoundResponse.setData(metaDataList);

        when(userManagementClient.getUserStatusMetaData()).thenReturn(southBoundResponse);
        when(handler.responseBuilder(metaDataList, "Success", "200")).thenReturn(northBoundResponse);

        // Act
        CommonNorthBoundResponse<List<MetaData>> response = userManagementService.getUserStatusMetaData(request);

        // Assert
        assertNotNull(response);
        assertEquals(metaDataList, response.getData());
        verify(userManagementClient, times(1)).getUserStatusMetaData();
        verify(handler, times(1)).responseBuilder(metaDataList, "Success", "200");
    }

    // --- validateEmail ---
    @Test
    void testValidateEmail_BaseException() {
        String email = "fail@example.com";
        HttpServletRequest request = mock(HttpServletRequest.class);
        BaseException baseException = new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "400", null);
        when(userManagementClient.validateEmail(new EmailValidationRequest())).thenThrow(baseException);

        BaseException ex = assertThrows(BaseException.class, () ->
                userManagementService.validateEmail(new EmailValidationRequest(), request));
        assertEquals("fail", ex.getMessage());
    }



    // --- getUserStatusMetaData ---
    @Test
    void testGetUserStatusMetaData_BaseException() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        BaseException baseException = new BaseException("fail", "fail", HttpStatus.BAD_REQUEST, "400", null);
        when(userManagementClient.getUserStatusMetaData()).thenThrow(baseException);

        BaseException ex = assertThrows(BaseException.class, () ->
                userManagementService.getUserStatusMetaData(request));
        assertEquals("fail", ex.getMessage());
    }










}

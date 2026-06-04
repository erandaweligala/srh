package com.adl.et.telco.dte.adminauthmgt.controller.ums;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.*;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.UserManagementInterface;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/srh/user-management/user")
@RequiredArgsConstructor
public class UserManagementController extends BaseController {

    private final UserManagementInterface userManagementInterface;

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("")
    public ResponseEntity<CommonNorthBoundResponse<List<AllUserDetails>>> getAllUsers(
            @RequestParam String limit,
            @RequestParam String offset,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String roleId,
            @RequestParam(required = false) String statusId,
            HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.getAllUsers(limit, offset, userName, roleId, statusId, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("/user-list")
    public ResponseEntity<CommonNorthBoundResponse<List<AllUserDetails>>> getAllFilteredUserList(@RequestBody TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.getAllFilteredUserList(tableFilterRequest,httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/{userId}")
    public ResponseEntity<CommonNorthBoundResponse<UserDetails>> getUserDetails(@PathVariable String userId, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.getUserDetails(userId, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> createUser(@RequestBody CreateUserRequest newUser, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.createUser(newUser, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("/check-valid-email")
    public ResponseEntity<CommonNorthBoundResponse<EmailValidateResponse>> validateEmail(@RequestBody EmailValidationRequest emailValidationRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.validateEmail(emailValidationRequest, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PatchMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> editUser(@RequestBody EditUserRequest user, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.editUser(user, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/status/meta-data")
    public ResponseEntity<CommonNorthBoundResponse<List<MetaData>>> getUserStatusMetaData(HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(userManagementInterface.getUserStatusMetaData(httpServletRequest));
    }

}

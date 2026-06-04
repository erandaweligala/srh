package com.adl.et.telco.dte.adminauthmgt.controller.ums;



import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents.MenuComponents;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.PermissionManagementInterface;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/srh/user-management/permissions")
@RequiredArgsConstructor
public class PermissionManagementController extends BaseController {

    private final PermissionManagementInterface permissionManagementInterface;

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("")
    public ResponseEntity<CommonNorthBoundResponse<List<PermissionView>>> getPermissionList(
            @RequestParam(required = false) String permissionName,
            @RequestParam(required = false) String menuId,
            @RequestParam(required = false) String sectionId,
            @RequestParam() String limit,
            @RequestParam() String offset, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getPermissionList(permissionName, menuId, sectionId, limit, offset, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/{permissionId}")
    public ResponseEntity<CommonNorthBoundResponse<PermissionDetails>> getPermissionDetails(
            @PathVariable String permissionId, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getPermissionDetails(permissionId, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/meta-data")
    public ResponseEntity<CommonNorthBoundResponse<List<PermissionMetaData>>> getPermissionMetaData(HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getPermissionMetaData());
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/permissions-by-component")
    public ResponseEntity<CommonNorthBoundResponse<AllActions>> getActionHierarchy(
            @RequestParam String componentId, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getActionHierarchy(componentId));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/menu-to-component")
    public ResponseEntity<CommonNorthBoundResponse<List<MenuComponents>>> getAllMenuAndComponents(HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getAllMenuAndComponents());
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> createPermission(@RequestBody CreatePermission createPermission, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.createPermission(createPermission, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PatchMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> editPermission(@RequestBody EditPermission editPermission, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.editPermission(editPermission, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("/permission-list")
    public ResponseEntity<CommonNorthBoundResponse<List<PermissionView>>> getFilteredPermissionList(@RequestBody TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(permissionManagementInterface.getFilteredPermissionList(tableFilterRequest, httpServletRequest));
    }
}

package com.adl.et.telco.dte.adminauthmgt.controller.ums;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.CreateNewRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleDetails;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleView;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.UpdateRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums.RoleManagementInterface;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/srh/user-management/roles")
public class RoleManagementController extends BaseController {

    @Autowired
    private RoleManagementInterface roleManagementInterface;

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("")
    public ResponseEntity<CommonNorthBoundResponse<List<RoleView>>> getRoleList(@RequestParam int limit, @RequestParam int offset, @RequestParam(required = false) String roleName, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.getRoleList(limit, offset, roleName, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/{roleId}")
    public ResponseEntity<CommonNorthBoundResponse<RoleDetails>> getRoleList(@PathVariable String roleId, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.getRoleDetails(roleId, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> createRole(@RequestBody CreateNewRole createNewRoleRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.createRole(createNewRoleRequest, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @PatchMapping("")
    public ResponseEntity<CommonNorthBoundResponse<String>> updateRole(@RequestBody UpdateRole updateRoleRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.updateRole(updateRoleRequest, httpServletRequest));
    }

    @PreAuthorize("hasAuthority('1')")
    @GetMapping("/meta-data")
    public ResponseEntity<CommonNorthBoundResponse<List<MetaData>>> getRoleMetaData(HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.getRoleMetaData());
    }

    @PreAuthorize("hasAuthority('1')")
    @PostMapping("/role-list")
    public ResponseEntity<CommonNorthBoundResponse<List<RoleView>>> getFilteredUserList(@RequestBody TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest) throws BaseException {
        return setResponseEntity(roleManagementInterface.getFilteredRoleList(tableFilterRequest, httpServletRequest));
    }

}

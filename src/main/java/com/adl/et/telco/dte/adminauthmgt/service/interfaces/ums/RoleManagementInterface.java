package com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.MetaData;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.CreateNewRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleDetails;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.RoleView;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.role.UpdateRole;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface RoleManagementInterface {
    CommonNorthBoundResponse<List<RoleView>> getRoleList(int limit, int offset, String roleName, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<RoleDetails> getRoleDetails(String roleId, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<String> createRole(CreateNewRole createNewRoleRequest, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<String> updateRole(UpdateRole updateRoleRequest, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<List<MetaData>> getRoleMetaData();

    CommonNorthBoundResponse<List<RoleView>> getFilteredRoleList(TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest);
}


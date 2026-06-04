package com.adl.et.telco.dte.adminauthmgt.service.interfaces.ums;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.*;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.permission.menuandcomponents.MenuComponents;
import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.TableFilterRequest;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface PermissionManagementInterface {

    CommonNorthBoundResponse<PermissionDetails> getPermissionDetails(String permissionId, HttpServletRequest httpServletRequest) throws BaseException;

    CommonNorthBoundResponse<AllActions> getActionHierarchy(String componentId) throws BaseException;

    CommonNorthBoundResponse<List<MenuComponents>> getAllMenuAndComponents() throws BaseException;

    CommonNorthBoundResponse<String> createPermission(CreatePermission createPermission, HttpServletRequest httpServletRequest) throws BaseException;

    CommonNorthBoundResponse<String> editPermission(EditPermission editPermission, HttpServletRequest httpServletRequest) throws BaseException;

    CommonNorthBoundResponse<List<PermissionMetaData>> getPermissionMetaData() throws BaseException;

    CommonNorthBoundResponse<List<PermissionView>> getPermissionList(String permissionName, String menuId, String sectionId, String limit, String offset, HttpServletRequest httpServletRequest);

    CommonNorthBoundResponse<List<PermissionView>> getFilteredPermissionList(TableFilterRequest tableFilterRequest, HttpServletRequest httpServletRequest);
}


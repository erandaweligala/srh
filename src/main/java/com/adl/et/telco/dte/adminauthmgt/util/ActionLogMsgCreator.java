package com.adl.et.telco.dte.adminauthmgt.util;

import com.adl.et.telco.dte.adminauthmgt.dto.ums.user.FilterValue;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ActionLogMsgCreator {

    public String createMsgForGetPermission(String permissionName, String menuId, String sectionId){
        return "Get permission list with permissionName: "+permissionName+", menuId: "+menuId+", sectionId: "+sectionId;
    }

    public String createMsgForGetUserList(String userName, String roleId, String statusId, String email){
        return "Get user list with userName: "+userName+", roleId: "+roleId+", statusId: "+statusId+", email: "+email;
    }

    public String createMsgForFilterUserList(List<FilterValue> filterValues) {
        StringBuilder sb = new StringBuilder();
        if (filterValues == null || filterValues.isEmpty()) {
            return "No filter values provided";
        }
        for (FilterValue filterValue : filterValues) {
            sb.append("Column: ").append(filterValue.getColumnName()).append(", ");
            sb.append("Operation: ").append(filterValue.getOperation()).append(", ");
            if (filterValue.getValue() != null && filterValue.getValue().length > 0) {
                sb.append("Value: ");
                for (String value : filterValue.getValue()) {
                    sb.append(value).append(", ");
                }
            }
        }
        return sb.toString();
    }
}


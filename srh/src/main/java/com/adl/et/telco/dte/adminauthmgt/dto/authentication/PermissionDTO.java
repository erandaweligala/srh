package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class PermissionDTO {
    private List<Long> menuids;
    private List<ViewDTO> components;
}

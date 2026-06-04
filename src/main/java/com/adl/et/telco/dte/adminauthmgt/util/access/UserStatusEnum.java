package com.adl.et.telco.dte.adminauthmgt.util.access;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum UserStatusEnum {
    ACTIVE("1"),;

    private String code;
    public String code() {
        return code;
    }
}


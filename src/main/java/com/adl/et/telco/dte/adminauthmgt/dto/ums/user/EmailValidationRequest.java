package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailValidationRequest {
    private String email;
    private String userType;
}

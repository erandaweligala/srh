package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SamlUserData {
    private String email;
    private String requestId;
}

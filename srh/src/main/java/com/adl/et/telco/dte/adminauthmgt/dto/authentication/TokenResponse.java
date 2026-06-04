package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class TokenResponse {
    private String tempToken;
    private String requestVerificationToken;
}

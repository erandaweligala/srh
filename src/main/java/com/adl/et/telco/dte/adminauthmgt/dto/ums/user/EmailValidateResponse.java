package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailValidateResponse{
    private Boolean isValidUser;
    private ValidUserDetails userDetails;
}

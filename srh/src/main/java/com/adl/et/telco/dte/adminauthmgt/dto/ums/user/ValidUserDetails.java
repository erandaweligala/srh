package com.adl.et.telco.dte.adminauthmgt.dto.ums.user;

import lombok.*;

@Setter
@Getter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidUserDetails {

    private String mobileNumber;
    private String name;
    private String email;

}

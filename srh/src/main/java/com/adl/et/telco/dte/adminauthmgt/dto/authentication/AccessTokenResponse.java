package com.adl.et.telco.dte.adminauthmgt.dto.authentication;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class AccessTokenResponse {
    private String accessToken;

    @JsonIgnore
    private String requestVerificationToken;


    public AccessTokenResponse(String accessToken, String requestVerificationToken) {
        this.accessToken = accessToken;
        this.requestVerificationToken = requestVerificationToken;
    }
}

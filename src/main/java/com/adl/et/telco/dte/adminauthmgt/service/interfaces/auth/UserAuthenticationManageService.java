package com.adl.et.telco.dte.adminauthmgt.service.interfaces.auth;

import com.adl.et.telco.dte.adminauthmgt.dto.authentication.SamlRequest;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;

import java.io.IOException;

public interface UserAuthenticationManageService {
    CommonNorthBoundResponse<SamlRequest> createSamlRequest(String uuid) throws BaseException, IOException;

}


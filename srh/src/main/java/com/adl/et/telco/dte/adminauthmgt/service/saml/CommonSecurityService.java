package com.adl.et.telco.dte.adminauthmgt.service.saml;

import com.adl.et.telco.dte.adminauthmgt.dto.authentication.UserBasicInfo;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.util.access.UserStatusEnum;
import com.adl.et.telco.dte.adminauthmgt.util.exception.BaseException;
import com.adl.et.telco.dte.adminauthmgt.util.resultenum.ResponseCodeEnum;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class CommonSecurityService {

    public boolean isEligible(CommonSouthBoundResponse<UserBasicInfo> body) throws BaseException {
        Boolean isEligible = false;
        try {
            UserBasicInfo userBasicInfo = body.getResponseData();
            if (UserStatusEnum.ACTIVE.code().equalsIgnoreCase(userBasicInfo.getStatus()))
                isEligible = true;
            return isEligible;
        } catch (Exception ex) {
            throw new BaseException(ex.getMessage(), ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.description(), HttpStatus.INTERNAL_SERVER_ERROR, ResponseCodeEnum.EXCEPTION_SERVICE_LAYER.code(), ex.getStackTrace());
        }
    }
}


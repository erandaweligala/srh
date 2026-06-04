package com.adl.et.telco.dte.adminauthmgt.util;

import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonNorthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.CommonSouthBoundResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.common.PageDetailDto;
import com.adl.et.telco.dte.adminauthmgt.dto.common.Result;
import org.springframework.stereotype.Component;

@Component
public class ResponseHandler {
    public <T> CommonSouthBoundResponse<T> respHandler(String code, String description){
        CommonSouthBoundResponse<T> resp = new CommonSouthBoundResponse<>();
        commonAdaptorRespCreator(resp,code,description);
        return resp;
    }

    public <T> CommonNorthBoundResponse<T> northBoundRespHandler(String code, String description){
        CommonNorthBoundResponse<T> resp = new CommonNorthBoundResponse<>();
        resp.setCode(code);
        resp.setDescription(description);
        resp.setData(null);
        return resp;
    }


    public <T> CommonNorthBoundResponse<T> responseBuilder(T object, String description, String code){
        CommonNorthBoundResponse<T> resp = new CommonNorthBoundResponse<>();
        resp.setCode(code);
        resp.setDescription(description);
        resp.setData(object);
        return resp;
    }

    public <T> CommonNorthBoundResponse<T> responseBuilderWithPageInformation(T object, String description,
                                                                              String code, PageDetailDto pageDetailDto){
        CommonNorthBoundResponse<T> resp = new CommonNorthBoundResponse<>();
        resp.setCode(code);
        resp.setDescription(description);
        resp.setData(object);
        resp.setPageDetail(pageDetailDto);
        return resp;
    }

    private void commonAdaptorRespCreator(CommonSouthBoundResponse commonSouthBoundResponse, String code, String description){
        Result result = new Result();
        result.setResultCode(code);
        result.setResultDescription(description);
        commonSouthBoundResponse.setResult(result);
    }
}


package com.adl.et.telco.dte.adminauthmgt.dto.fileupload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseHeader {

    private LocalDateTime timestamp;
    private String responseCode;
    private String responseDesc;
    private String appCode;

}

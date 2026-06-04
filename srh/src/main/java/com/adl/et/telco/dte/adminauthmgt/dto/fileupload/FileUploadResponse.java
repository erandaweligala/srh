package com.adl.et.telco.dte.adminauthmgt.dto.fileupload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author Deshala Mendis
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {

    private List<String> msisdnList;

    private ResponseHeader responseHeader;

}

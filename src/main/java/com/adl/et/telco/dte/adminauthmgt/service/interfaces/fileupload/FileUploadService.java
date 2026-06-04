package com.adl.et.telco.dte.adminauthmgt.service.interfaces.fileupload;

import com.adl.et.telco.dte.adminauthmgt.dto.fileupload.FileUploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Deshala Mendis
 * @version 1.0
 * @since 12.11.2020
 */
public interface FileUploadService {

    /**
     * Read excel - extract msisdn and send response
     * @param file
     * @return
     */
    ResponseEntity<FileUploadResponse> readExcelFile(MultipartFile file);

}
package com.adl.et.telco.dte.adminauthmgt.controller.fileupload;


import com.adl.et.telco.dte.adminauthmgt.controller.BaseController;
import com.adl.et.telco.dte.adminauthmgt.dto.fileupload.FileUploadResponse;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.fileupload.FileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


/**
 * To handle file upload requests
 * @author Deshala Mendis
 * @version 1.0
 * @since 12.11.2020
 */
@Slf4j
@RestController
@RequestMapping("${base-url.context}")
public class FileUploadManagementController extends BaseController {

//    private static final Logger log = LoggingUtils.getLogger(FileUploadManagementController.class.getName());

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * To read excel
     * @param file
     * @return
     */
    @PostMapping("/upload-file")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        log.debug("Multipart file received for extract");
        return fileUploadService.readExcelFile(file);
    }
}

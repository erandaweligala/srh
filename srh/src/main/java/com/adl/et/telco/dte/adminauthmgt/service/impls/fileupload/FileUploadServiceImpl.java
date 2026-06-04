package com.adl.et.telco.dte.adminauthmgt.service.impls.fileupload;

import com.adl.et.telco.dte.adminauthmgt.dto.fileupload.FileUploadResponse;
import com.adl.et.telco.dte.adminauthmgt.dto.fileupload.ResponseHeader;
import com.adl.et.telco.dte.adminauthmgt.service.interfaces.fileupload.FileUploadService;
import com.adl.et.telco.dte.adminauthmgt.util.constants.AdminAuthConstant;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author Deshala Mendis
 * @version 1.0
 * @since 12.11.2020
 */
@Service
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

//    private static final Logger log = LoggingUtils.getLogger(FileUploadServiceImpl.class.getName());

    @Value("${excel.read.col.index}")
    private int columnIndex;

    /**
     * Read excel and extract msisdn
     * @param file
     * @return
     */
    @Override
    public ResponseEntity<FileUploadResponse> readExcelFile(MultipartFile file) {

        XSSFWorkbook workbook;
        InputStream inputStream;
        Sheet sheet;
        DataFormatter dataFormatter = new DataFormatter();

        List<String> msisdnList = new ArrayList<>();

        ResponseHeader responseHeader;
        FileUploadResponse fileUploadResponse;

        try {
            inputStream = file.getInputStream();
            workbook = new XSSFWorkbook(inputStream);
            sheet = workbook.getSheetAt(0);
            Row row;
            Cell cell;

            for (int i = 1; i <= sheet.getLastRowNum(); i++){
                row = sheet.getRow(i);
                if (Objects.nonNull(row) && row != null){

                    cell = row.getCell(columnIndex);

                    // add to String list
                    String msisdn = dataFormatter.formatCellValue(cell);

                    if (msisdn != null && !msisdn.isEmpty()) {
                        msisdnList.add(msisdn);
                    }
                }
            }

        }catch (Exception exception){
            log.error(exception.toString());

            responseHeader = new ResponseHeader(
                    LocalDateTime.now(),
                    AdminAuthConstant.ERROR_RES_CODE,
                    exception.toString(),
                    AdminAuthConstant.OPERATION_FAILED_APP_CODE);

            fileUploadResponse = new FileUploadResponse(msisdnList, responseHeader);


            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON).
                    body(fileUploadResponse);
        }

        log.debug("Msisdn List Size: {}", msisdnList.size());

        responseHeader = new ResponseHeader(
                LocalDateTime.now(),
                AdminAuthConstant.OK_RES_CODE,
                AdminAuthConstant.OK_RESPONSE,
                AdminAuthConstant.OPERATION_SUCCESS_APP_CODE);

        fileUploadResponse = new FileUploadResponse(msisdnList, responseHeader);


        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON).
                body(fileUploadResponse);
    }
}

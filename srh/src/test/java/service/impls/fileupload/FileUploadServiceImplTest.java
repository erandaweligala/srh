package service.impls.fileupload;

import com.adl.et.telco.dte.adminauthmgt.dto.fileupload.FileUploadResponse;
import com.adl.et.telco.dte.adminauthmgt.service.impls.fileupload.FileUploadServiceImpl;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class FileUploadServiceImplTest {

    @InjectMocks
    private FileUploadServiceImpl fileUploadService; // Service under test

    @Mock
    private MultipartFile file; // Mocked MultipartFile

    @BeforeEach
    void setUp()throws Exception {
        MockitoAnnotations.openMocks(this);
        Field columnIndexField = FileUploadServiceImpl.class.getDeclaredField("columnIndex");
        columnIndexField.setAccessible(true);
        columnIndexField.set(fileUploadService, 0);

    }

    @Test
    void testReadExcelFile_Success() throws IOException {
        // Create a mock Excel file
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet();
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Header");

        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue("1234567890");

        // Convert the workbook to a byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        byte[] excelData = outputStream.toByteArray();

        // Mock the file input stream
        MockMultipartFile mockFile = new MockMultipartFile("file", "test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelData);

        // Call the method
        ResponseEntity<FileUploadResponse> response = fileUploadService.readExcelFile(mockFile);

        // Assert the response
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().getMsisdnList().size());
        assertEquals("1234567890", response.getBody().getMsisdnList().get(0));
    }

    @Test
    void testReadExcelFile_Exception() throws IOException {
        // Mock file to throw an exception
        when(file.getInputStream()).thenThrow(new RuntimeException("Test exception"));

        // Call the method
        ResponseEntity<FileUploadResponse> response = fileUploadService.readExcelFile(file);

        // Assert the response
        assertEquals(500, response.getStatusCodeValue());
        //assertEquals("Test exception", response.getBody().getResponseHeader().getMessage());
    }
}

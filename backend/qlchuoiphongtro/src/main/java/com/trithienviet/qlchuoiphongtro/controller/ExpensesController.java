package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.ExpensesDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.service.ExpensesService;
import com.trithienviet.qlchuoiphongtro.service.FileService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/expenses")
@SecurityRequirement(name = "Manager Room Application")
public class ExpensesController {

        @Autowired
        private ExpensesService expenseService;

        @Autowired
        private FileService fileService;

        @Value("${project.image}")
        private String imagePath;

        @PostMapping("/upload-evidence")
        public ResponseEntity<Map<String, String>> uploadEvidence(
                        @RequestParam("file") MultipartFile file) {
                try {
                        String folder = imagePath + "expenses/";
                        String fileName = fileService.uploadImage(folder, file);
                        String url = "/api/v1/admin/expenses/evidence/" + fileName;
                        return ResponseEntity.ok(Map.of("fileName", fileName, "url", url));
                } catch (IOException e) {
                        throw new RuntimeException("Không thể upload file: " + e.getMessage());
                }
        }

        @GetMapping("/evidence/{fileName}")
        public ResponseEntity<InputStreamResource> getEvidence(@PathVariable String fileName) {
                try {
                        String folder = imagePath + "expenses/";
                        InputStream stream = fileService.getResource(folder, fileName);

                        MediaType mediaType = MediaType.IMAGE_JPEG;
                        String lower = fileName.toLowerCase();
                        if (lower.endsWith(".png"))
                                mediaType = MediaType.IMAGE_PNG;
                        else if (lower.endsWith(".gif"))
                                mediaType = MediaType.IMAGE_GIF;
                        else if (lower.endsWith(".webp"))
                                mediaType = MediaType.valueOf("image/webp");
                        else if (lower.endsWith(".pdf"))
                                mediaType = MediaType.APPLICATION_PDF;

                        return ResponseEntity.ok()
                                        .contentType(mediaType)
                                        .body(new InputStreamResource(stream));
                } catch (Exception e) {
                        return ResponseEntity.notFound().build();
                }
        }

        @PostMapping
        public ResponseEntity<ExpensesDTO> createExpense(
                        @RequestParam String payer,
                        @RequestParam String expenseCategory,
                        @RequestParam BigDecimal amount,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentDate,
                        @RequestParam(required = false) String payeeName,
                        @RequestParam(required = false) String evidenceUrl,
                        @RequestParam(required = false) String description,
                        @RequestParam(required = false) Integer maintenanceRequestId,
                        @RequestParam(required = false) Integer branchId,
                        @AuthenticationPrincipal UserDetails userDetails) {

                return new ResponseEntity<>(
                                expenseService.createExpense(
                                                payer, expenseCategory, amount, paymentDate,
                                                payeeName, evidenceUrl, description,
                                                maintenanceRequestId, branchId,
                                                userDetails.getUsername()),
                                HttpStatus.CREATED);
        }

        @GetMapping("/{expenseId}")
        public ResponseEntity<ExpensesDTO> getById(@PathVariable Long expenseId) {
                return ResponseEntity.ok(expenseService.getExpenseById(expenseId));
        }

        @GetMapping
        public ResponseEntity<PageResponse<ExpensesDTO>> filter(
                        @RequestParam(required = false) String payer,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) Integer branchId,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                        @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
                        @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
                        @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
                        @RequestParam(defaultValue = "desc", required = false) String sortOrder) {

                return ResponseEntity.ok(
                                expenseService.filterExpenses(
                                                payer, category, branchId, from, to,
                                                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder));
        }

        @GetMapping("/maintenance/{requestId}")
        public ResponseEntity<PageResponse<ExpensesDTO>> getByMaintenanceRequest(
                        @PathVariable Integer requestId,
                        @RequestParam(defaultValue = "1") Integer pageNumber,
                        @RequestParam(defaultValue = "10") Integer pageSize) {

                return ResponseEntity.ok(
                                expenseService.getExpensesByMaintenanceRequest(
                                                requestId, Math.max(0, pageNumber - 1), pageSize));
        }

        @PatchMapping("/{expenseId}")
        public ResponseEntity<ExpensesDTO> update(
                        @PathVariable Long expenseId,
                        @RequestParam(required = false) String expenseCategory,
                        @RequestParam(required = false) BigDecimal amount,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentDate,
                        @RequestParam(required = false) String payeeName,
                        @RequestParam(required = false) String evidenceUrl,
                        @RequestParam(required = false) String description) {

                return ResponseEntity.ok(
                                expenseService.updateExpense(
                                                expenseId, expenseCategory, amount,
                                                paymentDate, payeeName, evidenceUrl, description));
        }

        @DeleteMapping("/{expenseId}")
        public ResponseEntity<String> delete(@PathVariable Long expenseId) {
                return ResponseEntity.ok(expenseService.deleteExpense(expenseId));
        }
}

package com.trithienviet.qlchuoiphongtro.payloads;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BulkBranchRequest {
    @NotBlank(message = "Tên chi nhánh không được để trống")
    private String branchName;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotEmpty(message = "Phải có ít nhất một tầng được khởi tạo")
    private List<BulkFloorRequest> floors;
}
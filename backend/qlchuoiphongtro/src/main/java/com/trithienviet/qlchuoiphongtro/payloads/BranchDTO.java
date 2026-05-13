package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BranchDTO {
    private  Integer branchId;
    private String branchName;
    private String address;
    private Long managerId;
}

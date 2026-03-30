package com.trithienviet.qlchuoiphongtro.payloads;

import com.trithienviet.qlchuoiphongtro.entity.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data

public class UpdateRoleDTO {
     private String role;
}

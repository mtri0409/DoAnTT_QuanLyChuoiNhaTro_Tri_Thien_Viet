package com.trithienviet.qlchuoiphongtro.payloads;

import com.trithienviet.qlchuoiphongtro.entity.UserRole;

import lombok.Data;


public class UpdateRoleDTO {
    private UserRole userRole;

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }
}

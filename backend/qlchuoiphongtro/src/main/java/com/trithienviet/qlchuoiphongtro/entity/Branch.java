package com.trithienviet.qlchuoiphongtro.entity;

import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "branches") // Sửa tên bảng cho đúng chính tả
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long branchId;

    @NotBlank(message = "Branch name is required")
    @Size(min = 5, message = "Branch name must contain at least 5 characters")
    private String branchName;

    @NotBlank(message = "Address is required")
    @Size(min = 20, message = "Address must contain at least 20 characters")
    private String address;

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Floor> floors;

    @ManyToMany(mappedBy = "branches")
    private List<User> users;
}
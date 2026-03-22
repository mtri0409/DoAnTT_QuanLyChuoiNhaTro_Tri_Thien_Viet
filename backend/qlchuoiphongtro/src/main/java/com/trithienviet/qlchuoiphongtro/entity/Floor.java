package com.trithienviet.qlchuoiphongtro.entity;

import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "floors")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long floorId;

    @Min(value = 0, message = "Floor number cannot be less than 0")
    private Integer floorNumber; // Dùng Integer cho số tầng là đủ

    @ManyToOne(fetch = FetchType.LAZY) // Thêm LAZY để tối ưu hiệu năng
    @JoinColumn(name = "branch_id")
    private Branch branch; 

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms;
}
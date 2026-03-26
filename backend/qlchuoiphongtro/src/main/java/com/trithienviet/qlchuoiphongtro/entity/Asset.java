package com.trithienviet.qlchuoiphongtro.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
 @Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity 
@Table(name="assets")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer assetId;
    
    @NotBlank
    @Size(min=5, message = "Asset name must contain at least 5 characters")
    private String assetName;

    private String brand; // Hãng (Samsung, Panasonic...)

    @Column(name = "serial_number")
    private String serialNumber; // Dùng camelCase cho Java

    private String status; // Tình trạng: New, Good, Broken...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="room_id")
    private Room room;

    @OneToMany(mappedBy = "asset", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<MaintenanceRequest> maintenanceHistory;
}
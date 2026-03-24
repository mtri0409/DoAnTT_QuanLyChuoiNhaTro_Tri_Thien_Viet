package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="services")
public class ServiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer serviceId;
    @NotBlank(message = "Service name can not blank")
    private String serviceName;

    @NotBlank
    private String unit; // chỉ số : "kWh", "m3", "Phòng", "Người"
    @DecimalMin(value = "0.0",message = "Price service can not less than 0 .")
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private String serviceType; // METERED -or FIXED
    private Boolean is_active = false;   // Để ẩn/hiện dịch vụ khi không dùng nữa

    @ManyToMany(mappedBy = "services", fetch = FetchType.LAZY)
    private Set<Room> rooms = new HashSet<>();

    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    private List<InvoiceDetail> invoiceDetails = new ArrayList<>();

    @OneToMany(mappedBy = "service")
    private List<MeterReading> meterReadings;
}

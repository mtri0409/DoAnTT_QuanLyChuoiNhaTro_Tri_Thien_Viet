package com.trithienviet.qlchuoiphongtro.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
@Table(name="rooms")
@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @NotBlank
    @Size(min=3, message = "Room name must contain at least 3 characters ")
    private String roomName;

    @DecimalMin(value = "0.0",message = "Price cannot be less than 0")
    private BigDecimal price;

    @Min(value = 0, message = "Max people be less than 0")
    private Integer maxPeople;

    @Min(value = 0,message = "Current people be less than 0")
    private Integer currentPeople = 0;
    @NotBlank
    @Column(columnDefinition = "TEXT")
    @Size(min=20, message = "Description  must contain at least 20 characters ")
    private String description;

    @Enumerated(EnumType.STRING) 
    @Column(length = 20)
    private RoomStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="floor_id")
    private Floor floor;

    @OneToMany (mappedBy = "room", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private List<RoommatePost> roommatePosts;

    @OneToMany(mappedBy = "room",fetch = FetchType.LAZY,cascade = CascadeType.ALL,orphanRemoval = true)
    private List<RoomMedia> roomMedia;

    @ManyToMany(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE})
    @JoinTable(
        name="room_amenitites",
        joinColumns = @JoinColumn(name="room_id"),
        inverseJoinColumns = @JoinColumn(name="amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();
 
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Asset> assets;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<MaintenanceRequest> maintenanceHistory;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_services",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<ServiceItem> services = new HashSet<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<MeterReading> meterReadings;

    // Trong Room.java
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles = new ArrayList<>();

}

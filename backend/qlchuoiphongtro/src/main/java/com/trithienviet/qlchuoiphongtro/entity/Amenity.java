package com.trithienviet.qlchuoiphongtro.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name="amenities")
public class Amenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer amenityId;

    @NotBlank
    @Size(min=2,message="Amenity name must contain at least than 2 characters")
    private Long amenityName;
    
    private String icon;

    @ManyToMany(mappedBy = "amenities",fetch= FetchType.LAZY)
    private Set<Room> rooms = new HashSet<>();
}

package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name="profiles")
@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @NotBlank(message = "Full name can not blank")
    @Size(min=8, message ="Full name must contain at least more 8 characters")
    @Pattern(regexp = "^[a-zA-Z]*$", message = "Full Name must not contain numbers or special")
    private String fullName;

    @Size(min = 10, max =10 , message =  "Mobile Number must be axactly 10 digits long")
    @Pattern(regexp = "^\\d{10}$",message = "Mobile Number must contain only numbers")
    private String phone;

    @Email
    @Column(unique = true, nullable = true)
    private String email;

    @Size(min = 12, max =12 , message =  "identity number must be axactly 10 digits long")
    private String identity_number;

    @Size(min = 20, message = "Address must contain at least 20 characters")
    private String address;

    @Column(nullable = true)
    private String idFrontImage;
     @Column(nullable = true)
    private String idBackImage;

    @Column(name = "id_expiration_date")
    private LocalDate idExpirationDate; // Ngày hết hạn CCCD/Hộ chiếu

    @Column(name = "id_issue_date")
    private LocalDate idIssueDate;     // Ngày cấp (Nên có để đối chiếu)

    @Column(name = "id_issue_place")
    private String idIssuePlace;       // Nơi cấp (Cục Cảnh sát QLHC về trật tự xã hội)

    @OneToOne(mappedBy = "profile",cascade = CascadeType.PERSIST,orphanRemoval = true)
    private User user;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Vehicle> vehicles = new ArrayList<>();

}

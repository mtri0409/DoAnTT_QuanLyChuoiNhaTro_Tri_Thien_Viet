package com.trithienviet.qlchuoiphongtro.payloads;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ProfileImageDTO {
    private String idFrontImage;
    private String idBackImage;
    
}

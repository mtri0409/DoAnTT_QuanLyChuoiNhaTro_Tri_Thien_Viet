package com.trithienviet.qlchuoiphongtro.payloads;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SettingImageDTO {
    private String logo;
    private String favicon;
}

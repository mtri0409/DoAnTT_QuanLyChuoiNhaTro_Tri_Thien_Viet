package com.trithienviet.qlchuoiphongtro.payloads;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SettingDTO {
    private String name;
    private String hotline;
    private String email;
    private String logo;
    private String favicon;
    private String facebookLink;
    private String youtubeLink;
    private String address;
    private String copyrightText;
    private String primaryColor;
    private Boolean isMaintenance;
}
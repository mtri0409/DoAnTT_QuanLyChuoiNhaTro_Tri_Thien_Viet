package com.trithienviet.qlchuoiphongtro.payloads;

import lombok.Data;

@Data
public class AiConfigurationDTO {
    private Long configId;
    private String apiKey;
    private String baseUrl;
    private String model;
    private String description;
}
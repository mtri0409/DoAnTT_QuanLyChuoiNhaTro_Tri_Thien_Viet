package com.trithienviet.qlchuoiphongtro.payloads;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Payload gửi tới AI Service FastAPI (/api/v1/chat).
 */
@Data
public class ChatPayload {
    private String message;
    private String provider;

    @JsonProperty("api_key")
    private String apiKey;

    @JsonProperty("base_url")
    private String baseUrl;

    @JsonProperty("model_name")
    private String modelName;

    @JsonProperty("java_backend_url")
    private String javaBackendUrl;
}

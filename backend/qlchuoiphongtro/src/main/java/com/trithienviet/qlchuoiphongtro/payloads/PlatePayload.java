package com.trithienviet.qlchuoiphongtro.payloads;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data; // Nếu bạn dùng Lombok
import java.util.List;

@Data // Tự động sinh Getters, Setters, toString...
public class PlatePayload {

    @JsonProperty("track_id")
    private int trackId;

    @JsonProperty("status")
    private String status; // "SUCCESS" hoặc "FAILED"

    @JsonProperty("best_plate")
    private String bestPlate; // Biển số chốt cuối cùng (ví dụ: "43C12345")

    @JsonProperty("confidence_votes")
    private String confidenceVotes; // "4/5"

    @JsonProperty("unique_valid_plates")
    private List<String> uniqueValidPlates;

    @JsonProperty("raw_5_reads")
    private List<String> raw5Reads;

    @JsonProperty("timestamp")
    private String timestamp;
    @JsonProperty("plate_image_base64")
    private String plateImageBase64;
}

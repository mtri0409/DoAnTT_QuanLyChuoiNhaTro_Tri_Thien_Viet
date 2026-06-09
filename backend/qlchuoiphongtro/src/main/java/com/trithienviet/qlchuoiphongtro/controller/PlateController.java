package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class PlateController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // @PostMapping("/receive-plate")
    public ResponseEntity<String> receivePlateFromAI(@RequestBody PlatePayload payload) {

        System.out.println("\n");
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║                    NHẬN DATA TỪ PYTHON AI                      ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");

        try {
            String jsonString = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(payload);
            System.out.println("\n📦 FULL PAYLOAD RECEIVED:");
            System.out.println(jsonString);
        } catch (Exception e) {
            System.out.println("❌ Lỗi parse JSON: " + e.getMessage());
            System.out.println("Raw payload: " + payload);
        }

        System.out.println("\n📋 DETAILED INFORMATION:");
        System.out.println("├─ track_id: " + payload.getTrackId());
        System.out.println("├─ status: " + payload.getStatus());
        System.out.println("├─ best_plate: " + payload.getBestPlate());
        System.out.println("├─ confidence_votes: " + payload.getConfidenceVotes());
        System.out.println("├─ timestamp: " + payload.getTimestamp());

        if (payload.getUniqueValidPlates() != null && !payload.getUniqueValidPlates().isEmpty()) {
            System.out.println("├─ unique_valid_plates: " + String.join(", ", payload.getUniqueValidPlates()));
        } else {
            System.out.println("├─ unique_valid_plates: []");
        }

        if (payload.getRaw5Reads() != null && !payload.getRaw5Reads().isEmpty()) {
            System.out.println("├─ raw_5_reads:");
            for (int i = 0; i < payload.getRaw5Reads().size(); i++) {
                System.out.println("│   └─ [" + (i+1) + "] " + payload.getRaw5Reads().get(i));
            }
        } else {
            System.out.println("├─ raw_5_reads: []");
        }

        String plateImageBase64 = payload.getPlateImageBase64();
        if (plateImageBase64 != null && !plateImageBase64.isEmpty()) {
            System.out.println("├─ plate_image_base64: ✅ CÓ ẢNH");
            System.out.println("│   ├─ length: " + plateImageBase64.length() + " characters");
            System.out.println("│   ├─ size: ~" + (plateImageBase64.length() * 3 / 4) + " bytes");
            System.out.println("│   └─ preview (first 100 chars): " + plateImageBase64.substring(0, Math.min(100, plateImageBase64.length())) + "...");
        } else {
            System.out.println("├─ plate_image_base64: ❌ KHÔNG CÓ ẢNH");
        }

        System.out.println("\n🔍 PROCESSING RESULT:");

        if ("SUCCESS".equals(payload.getStatus())) {
            String plate = payload.getBestPlate();
            System.out.println("✅ STATUS: SUCCESS");
            System.out.println("├─ Biển số hợp lệ: " + plate);
            System.out.println("├─ Độ tin cậy: " + payload.getConfidenceVotes());
            System.out.println("└─ Số lần đọc thành công: " +
                (payload.getUniqueValidPlates() != null ? payload.getUniqueValidPlates().size() : 0));

            messagingTemplate.convertAndSend("/topic/plates", payload);
            System.out.println("\n📡 Đã broadcast qua WebSocket: /topic/plates");

        } else {
            System.out.println("❌ STATUS: FAILED");
            System.out.println("├─ Lý do: Không qua được regex validation hoặc OCR lỗi");

            if (payload.getRaw5Reads() != null && !payload.getRaw5Reads().isEmpty()) {
                System.out.println("└─ Các lần đọc thử: " + String.join(", ", payload.getRaw5Reads()));
            }

            messagingTemplate.convertAndSend("/topic/plates_errors", payload);
            System.out.println("\n📡 Đã broadcast lỗi qua WebSocket: /topic/plates_errors");
        }

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║                    KẾT THÚC XỬ LÝ                               ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        return new ResponseEntity<>("Java Backend đã nhận thành công!", HttpStatus.OK);
    }
}
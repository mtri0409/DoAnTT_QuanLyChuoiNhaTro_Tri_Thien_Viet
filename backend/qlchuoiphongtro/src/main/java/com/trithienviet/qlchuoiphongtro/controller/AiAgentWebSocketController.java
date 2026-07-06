package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.payloads.ChatPayload;
import com.trithienviet.qlchuoiphongtro.service.AiConfigurationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;

import java.security.Principal;
import java.util.Map;

/**
 * WebSocket controller xử lý chat AI từ Dashboard Admin.
 * Client gửi message tới /app/dashboard/agent, server phản hồi về /queue/agent-response.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class AiAgentWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate;
    private final AiConfigurationService aiConfigurationService;

    @Value("${app.ai-service-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    @Value("${app.java-backend-url:http://localhost:8080}")
    private String javaBackendUrl;

    @MessageMapping("/dashboard/agent")
    public void handleAgentMessage(String message, Principal principal, StompHeaderAccessor headerAccessor) {
        String userId = (principal != null) ? principal.getName() : headerAccessor.getSessionId();
        log.info("[AI Agent] Nhận tin nhắn từ user {}: {}", userId, message);

        try {
            String aiResponse = callAiService(message);
            messagingTemplate.convertAndSendToUser(userId, "/queue/agent-response", aiResponse);
            log.info("[AI Agent] Đã gửi phản hồi tới user {}", userId);
        } catch (Exception e) {
            log.error("[AI Agent] Lỗi xử lý tin nhắn: {}", e.getMessage(), e);
            messagingTemplate.convertAndSendToUser(userId, "/queue/agent-response",
                    "❌ Xin lỗi, hệ thống AI hiện không phản hồi. Vui lòng thử lại sau.");
        }
    }

    private String callAiService(String message) {
        var configOpt = aiConfigurationService.getAiConfig();
        var config = configOpt.orElseThrow(() -> new RuntimeException("Chưa cấu hình AI"));

        ChatPayload payload = new ChatPayload();
        payload.setMessage(message);
        payload.setProvider("MISTRAL");
        payload.setApiKey(config.getApiKey());
        payload.setBaseUrl(config.getBaseUrl());
        payload.setModelName(config.getModel());
        payload.setJavaBackendUrl(javaBackendUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ChatPayload> requestEntity = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                aiServiceBaseUrl + "/api/v1/chat", requestEntity, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("AI Service trả về lỗi: " + response.getStatusCode());
        }

        Object responseText = response.getBody().get("response");
        return responseText != null ? responseText.toString() : "Không nhận được phản hồi từ AI.";
    }
}

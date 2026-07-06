package com.trithienviet.qlchuoiphongtro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefix cho các topic broadcast (/topic) và queue cá nhân (/queue)
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix cho @MessageMapping (/app)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để client kết nối WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Cho phép tất cả origin (chỉ dùng cho dev)
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(org.springframework.http.server.ServerHttpRequest request,
                                                      org.springframework.web.socket.WebSocketHandler wsHandler,
                                                      Map<String, Object> attributes) {
                        // Nếu chưa đăng nhập, dùng session ID làm user name
                        // để convertAndSendToUser hoạt động với /queue/agent-response
                        String sessionId = UUID.randomUUID().toString();
                        return new Principal() {
                            @Override
                            public String getName() {
                                return sessionId;
                            }
                        };
                    }
                })
                .withSockJS();  // Hỗ trợ fallback cho trình duyệt không hỗ trợ WebSocket
    }
}

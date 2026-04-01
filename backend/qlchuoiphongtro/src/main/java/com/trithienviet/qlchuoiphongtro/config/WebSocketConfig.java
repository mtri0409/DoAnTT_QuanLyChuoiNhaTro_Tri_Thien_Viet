// package com.trithienviet.qlchuoiphongtro.config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.messaging.simp.config.MessageBrokerRegistry;
// import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
// import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
// import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// @Configuration
// @EnableWebSocketMessageBroker
// public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

//     @Override
//     public void registerStompEndpoints(StompEndpointRegistry registry) {
//         // Cổng kết nối từ React (Client)
//         registry.addEndpoint("/ws")
//                 .setAllowedOriginPatterns("*") 
//                 .withSockJS(); 
//     }

//     @Override
//     public void configureMessageBroker(MessageBrokerRegistry registry) {
//         // Topic để client đăng ký nhận tin (ví dụ: /topic/all hoặc /user/queue/noti)
//         registry.enableSimpleBroker("/topic", "/queue","/noti");
        
//         // Tiền tố cho các tin nhắn từ Client gửi lên Server (nếu có)
//         registry.setApplicationDestinationPrefixes("/app");
        
//         // Cấu hình gửi tin riêng cho từng User
//         registry.setUserDestinationPrefix("/user");
//     }
// }
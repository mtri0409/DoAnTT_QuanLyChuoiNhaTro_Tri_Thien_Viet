package com.trithienviet.qlchuoiphongtro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${path.images.room}")
    private String uploadDir;

    @Value("${path.images.post}")
    private String postImageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Khi gọi: http://localhost:8080/images/abc.jpg
        // Spring tìm file trong: uploads/room-images/abc.jpg
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + uploadDir + "/");

        registry.addResourceHandler("/images/posts/**")
                .addResourceLocations("file:" + postImageDir + "/");
    }
}
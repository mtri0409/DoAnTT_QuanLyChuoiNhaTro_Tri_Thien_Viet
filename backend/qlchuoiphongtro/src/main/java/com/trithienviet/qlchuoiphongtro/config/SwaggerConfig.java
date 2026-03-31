package com.trithienviet.qlchuoiphongtro.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenApi(){
        final String securitySchemeName = "Manager Room Application";

        Info info = new Info()
            .title("Manager Room Application")
            .description("Backend APIs for Manager Room app")
            .version("v1.0.0")
            .contact(new Contact().name("Minh Tri").url("minhtri05k47@gmail.com").email("minhtri05k47@gmail.com"))
            .license(new License().name("License").url("/"));
        return new OpenAPI()
            .info(info)
            .externalDocs(new ExternalDocumentation()
                .description("Manager Room App Documentation")
                .url("http://localhost:8080/swagger-ui/index.html")
            )
            // BƯỚC QUAN TRỌNG: Thêm cấu hình Security ở đây
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
package com.adl.et.telco.dte.adminauthmgt.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${base-url.context:/}") // default to root if not set
    private String basePath;

    // Defines OpenAPI metadata (shown in Swagger UI)
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Business-Template")
                        .version("v1.0")
                        .description("Welcome to Axonect Admin Portal")
                        .termsOfService("Terms of services")
                        .contact(new Contact()
                                .name("Admin")
                                .url("http://www.axiatadigitallabs.com")
                                .email("adl@axiatadigitallabs.com"))
                        .license(new License()
                                .name("License of API")
                                .url("API license URL")));
    }

    // Scans controller package for API docs
    @Bean
    public GroupedOpenApi adminAuthApi() {
        return GroupedOpenApi.builder()
                .group("admin-auth")
                .pathsToMatch(basePath + "/**")
                .packagesToScan("com.adl.et.telco.dte.adminauthmgt.controller")
                .build();
    }
}

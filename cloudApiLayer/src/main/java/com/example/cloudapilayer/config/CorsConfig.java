package com.example.cloudapilayer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(@NonNull CorsRegistry registry){
				registry.addMapping("/**")
					.allowedOrigins(
						"https://airline-frontend-app-876da0517315.herokuapp.com",
						"https://airline-frontend-app-554a763b7738.herokuapp.com"
					)
					.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
					.allowedHeaders("*")
					.exposedHeaders("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With")
					.allowCredentials(true)
					.maxAge(3600);
			}
		};
	}
}
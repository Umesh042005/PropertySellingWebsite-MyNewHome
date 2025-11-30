package com.property.property_selling.config;

import com.property.property_selling.security.JwtAuthenticationEntryPoint;
import com.property.property_selling.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint entryPoint;

    public SecurityConfig(JwtFilter jwtFilter, JwtAuthenticationEntryPoint entryPoint) {
        this.jwtFilter = jwtFilter;
        this.entryPoint = entryPoint;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)


                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration corsConfig = new CorsConfiguration();
                    corsConfig.addAllowedOrigin("http://localhost:3000");
                    corsConfig.addAllowedHeader("*");
                    corsConfig.addAllowedMethod("*");
                    corsConfig.setAllowCredentials(true);
                    return corsConfig;
                }))


                .headers(headers -> headers
                        .addHeaderWriter(new StaticHeadersWriter("Cross-Origin-Opener-Policy", "same-origin-allow-popups"))
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()
                        // FIX APPLIED HERE: /api/properties/upload ko cover karne ke liye /** laga diya
                        .requestMatchers(HttpMethod.POST, "/api/properties/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**").authenticated()
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/static/**", "/images/**", "/js/**", "/css/**").permitAll()
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

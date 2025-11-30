package com.property.property_selling.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    // Yeh method tab call hota hai jab koi unauthenticated user protected resource access karne ki koshish karta hai
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        //  Is line se client ko HTTP status code 401 (Unauthorized) milega
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Access Denied / Unauthorized: " + authException.getMessage());
    }
}
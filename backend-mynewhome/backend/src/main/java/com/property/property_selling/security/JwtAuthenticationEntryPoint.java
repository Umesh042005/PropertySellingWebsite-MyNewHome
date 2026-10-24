package com.property.property_selling.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Entry point for JWT authentication that handles unauthorized request access.
 * It returns an HTTP 401 JSON error when a protected resource is accessed without valid credentials.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    /**
     * Invoked when an unauthenticated user attempts to access a protected resource.
     *
     * @param request       the HTTP servlet request
     * @param response      the HTTP servlet response
     * @param authException the exception that occurred due to lack of authentication
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"Please log in to continue\"}");
    }
}

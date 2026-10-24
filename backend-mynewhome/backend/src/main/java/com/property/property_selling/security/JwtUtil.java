package com.property.property_selling.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * Utility class for handling JSON Web Tokens (JWT).
 * Provides helper methods for token generation, parsing, extraction, and validation.
 * The secret and validity come from configuration (JWT_SECRET / JWT_EXPIRATION_MS env vars),
 * never from source code.
 */
@Component
public class JwtUtil {

    private final Key signingKey;
    private final long expirationMs;

    /**
     * @param secret       HMAC secret, at least 32 characters (256-bit) for HS256
     * @param expirationMs token validity in milliseconds
     */
    public JwtUtil(@Value("${app.jwt.secret:}") String secret,
                   @Value("${app.jwt.expiration-ms}") long expirationMs) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be set and at least 32 characters long");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generates a signed JWT token containing the user's username as subject.
     *
     * @param username the user's unique username
     * @return a compact JWT token string
     */
    public String generateToken(String username) {
        long nowMillis = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(nowMillis))
                .setExpiration(new Date(nowMillis + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parses the token, verifying signature and expiry, and returns its subject.
     * Throws a JwtException if the token is invalid or expired.
     *
     * @param token the JWT token to extract from
     * @return the subject (username) of the token
     */
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}

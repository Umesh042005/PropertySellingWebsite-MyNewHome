package com.property.property_selling.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    //  Secret key (minimum 256-bit)
    private final String SECRET = "mysecretkeymysecretkeymysecretkey";

    //  Token validity – 5 hours
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 5;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    //  Generate token (can use email or username)
    public String generateToken(String identifier) {
        long nowMillis = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(identifier) // can be username or email
                .setIssuedAt(new Date(nowMillis))
                .setExpiration(new Date(nowMillis + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //  Extract subject (username/email)
    public String extractSubject(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .setAllowedClockSkewSeconds(3600)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    //  Added for backward compatibility
    public String extractUsername(String token) {
        return extractSubject(token);
    }


    //  Validate token (accept both username or email)
    public boolean validateToken(String token, String identifier) {
        String subject = extractSubject(token);
        return subject.equalsIgnoreCase(identifier) && !isTokenExpired(token);
    }

    //  Check expiry
    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .setAllowedClockSkewSeconds(3600)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }
}

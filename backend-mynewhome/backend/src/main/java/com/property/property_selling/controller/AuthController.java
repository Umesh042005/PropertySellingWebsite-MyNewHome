package com.property.property_selling.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.property.property_selling.dto.UserLoginDTO;
import com.property.property_selling.dto.UserRegistrationDTO;
import com.property.property_selling.dto.UserResponseDTO;
import com.property.property_selling.exception.ApiException;
import com.property.property_selling.model.User;
import com.property.property_selling.security.JwtUtil;
import com.property.property_selling.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final GoogleIdTokenVerifier googleVerifier;

    public AuthController(JwtUtil jwtUtil, UserService userService,
                          @Value("${app.google.client-id:}") String googleClientId) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.googleVerifier = googleClientId.isBlank() ? null
                : new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();
    }

    // Register and log the user in straight away
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody UserRegistrationDTO dto) {
        UserResponseDTO user = userService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse(user, null));
    }

    // Login with username or email
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserLoginDTO dto) {
        return authResponse(userService.login(dto), null);
    }

    @PostMapping("/google-login")
    public Map<String, Object> googleLogin(@RequestBody Map<String, String> request) {
        if (googleVerifier == null) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }
        GoogleIdToken idToken;
        try {
            idToken = googleVerifier.verify(request.get("credential"));
        } catch (Exception e) {
            log.warn("Google token verification failed", e);
            idToken = null;
        }
        if (idToken == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        Payload payload = idToken.getPayload();
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }
        String email = payload.getEmail();

        User user = userService.findByEmail(email);
        if (user == null) {
            user = userService.saveGoogleUser(email, (String) payload.get("name"));
        }
        return authResponse(userService.toDto(user), (String) payload.get("picture"));
    }

    private Map<String, Object> authResponse(UserResponseDTO user, String picture) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("picture", picture);

        Map<String, Object> body = new HashMap<>();
        body.put("token", jwtUtil.generateToken(user.getUsername()));
        body.put("user", userMap);
        return body;
    }
}

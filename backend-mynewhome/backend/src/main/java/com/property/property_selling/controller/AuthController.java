package com.property.property_selling.controller;

import com.property.property_selling.dto.UserLoginDTO;
import com.property.property_selling.dto.UserRegistrationDTO;
import com.property.property_selling.dto.UserResponseDTO;
import com.property.property_selling.model.User;
import com.property.property_selling.security.JwtUtil;
import com.property.property_selling.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import java.util.Collections;


import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.PUT})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDTO dto) {
        try {
            UserResponseDTO userResponse = userService.register(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDTO dto) {
        try {
            //  Authenticate manually using UserService
            UserResponseDTO userResponse = userService.login(dto);

            //  Generate JWT token
            String token = jwtUtil.generateToken(userResponse.getUsername());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "userId", userResponse.getId(),
                    "username", userResponse.getUsername(),
                    "role", userResponse.getRole()
            ));
        }
     catch (BadCredentialsException e) { // Yahan BadCredentialsException catch hogi
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
    }
        catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            String credential = request.get("credential");

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(
                    "69312397707-7g5e1c06e57ebn1akoj37cgmtcrt03qo.apps.googleusercontent.com"
            )).build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid Google token"));
            }

            Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            //  Check if user already exists
            User user = userService.findByEmail(email);
            if (user == null) {
                UserRegistrationDTO newUser = new UserRegistrationDTO();
                newUser.setEmail(email);
                newUser.setUsername(name);
                newUser.setPassword("GOOGLE_USER");  // Placeholder, not used for login
                user = userService.saveGoogleUser(newUser);
            }

            //  Important: generate token with username (not email)
            String token = jwtUtil.generateToken(user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "email", email,
                    "picture", picture
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Google Login Failed", "details", e.getMessage()));
        }
    }



}

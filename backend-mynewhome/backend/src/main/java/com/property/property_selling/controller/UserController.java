package com.property.property_selling.controller;

import com.property.property_selling.dto.UserResponseDTO;
import com.property.property_selling.dto.UserUpdateDTO;
import com.property.property_selling.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * "/me" is available to any logged-in user; every other endpoint is admin-only (see SecurityConfig).
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Current user's profile
    @GetMapping("/me")
    public UserResponseDTO me(@AuthenticationPrincipal UserDetails principal) {
        return userService.toDto(userService.getByUsername(principal.getUsername()));
    }

    // Get all users (admin)
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by ID (admin)
    @GetMapping("/{id}")
    public UserResponseDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Update user (admin)
    @PutMapping("/{id}")
    public UserResponseDTO updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO dto) {
        return userService.updateUser(id, dto);
    }

    // Delete user and their listings (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}

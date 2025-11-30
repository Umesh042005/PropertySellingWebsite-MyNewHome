package com.property.property_selling.service;

import com.property.property_selling.dto.UserRegistrationDTO;
import com.property.property_selling.dto.UserLoginDTO;
import com.property.property_selling.dto.UserResponseDTO;
import com.property.property_selling.dto.UserUpdateDTO;
import com.property.property_selling.model.User;
import com.property.property_selling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // ✅ Registration
    public UserResponseDTO register(UserRegistrationDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.create(
                dto.getUsername(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                "ROLE_USER"
        );

        userRepository.save(user);

        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    // ✅ Login
    // ✅ Login (UPDATED CODE)
    public UserResponseDTO login(UserLoginDTO dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                // User not found par BadCredentialsException throw karna secure practice hai.
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        // 🛑 CHANGE 🛑: RuntimeException ko BadCredentialsException se replace kiya
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    // ✅ Get all users
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole()))
                .collect(Collectors.toList());
    }

    // ✅ Get user by ID
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    // ✅ Update user
    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        userRepository.save(user);
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    // ✅ Delete user
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    public User saveGoogleUser(UserRegistrationDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode("GOOGLE_USER")); // ✅ Proper encoded password
        user.setRole("ROLE_USER"); // ✅ Role format same as register wala

        return userRepository.save(user);
    }



}

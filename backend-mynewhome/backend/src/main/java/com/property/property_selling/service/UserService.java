package com.property.property_selling.service;

import com.property.property_selling.dto.UserRegistrationDTO;
import com.property.property_selling.dto.UserLoginDTO;
import com.property.property_selling.dto.UserResponseDTO;
import com.property.property_selling.dto.UserUpdateDTO;
import com.property.property_selling.exception.ApiException;
import com.property.property_selling.model.User;
import com.property.property_selling.repository.PropertyRepository;
import com.property.property_selling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Pattern USERNAME = Pattern.compile("[A-Za-z0-9_.-]{3,30}");
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PasswordEncoder passwordEncoder;

    // Registration
    public UserResponseDTO register(UserRegistrationDTO dto) {
        String username = dto.getUsername() == null ? "" : dto.getUsername().trim();
        String email = dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase(Locale.ROOT);
        String password = dto.getPassword() == null ? "" : dto.getPassword();

        if (!USERNAME.matcher(username).matches()) {
            throw ApiException.badRequest("Username must be 3-30 characters: letters, numbers, . _ -");
        }
        if (!EMAIL.matcher(email).matches()) {
            throw ApiException.badRequest("Please enter a valid email address");
        }
        if (password.length() < 6) {
            throw ApiException.badRequest("Password must be at least 6 characters");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw ApiException.conflict("Username already taken");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw ApiException.conflict("Email already registered");
        }

        User user = User.create(username, email, passwordEncoder.encode(password), "ROLE_USER");
        userRepository.save(user);
        return toDto(user);
    }

    // Login with username or email
    public UserResponseDTO login(UserLoginDTO dto) {
        String identifier = dto.getUsername() == null ? "" : dto.getUsername().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier.toLowerCase(Locale.ROOT)))
                // Same message for unknown user and wrong password, so accounts can't be probed
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (dto.getPassword() == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return toDto(user);
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserResponseDTO getUserById(Long id) {
        return toDto(findById(id));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        User user = findById(id);
        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            if (!USERNAME.matcher(dto.getUsername()).matches()) {
                throw ApiException.badRequest("Username must be 3-30 characters: letters, numbers, . _ -");
            }
            if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
                throw ApiException.conflict("Username already taken");
            }
            user.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!EMAIL.matcher(email).matches()) throw ApiException.badRequest("Please enter a valid email address");
            if (userRepository.findByEmail(email).isPresent()) throw ApiException.conflict("Email already registered");
            user.setEmail(email);
        }
        userRepository.save(user);
        return toDto(user);
    }

    // Deletes the user together with their listings (otherwise the foreign key blocks the delete)
    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        propertyRepository.deleteByOwner(user);
        userRepository.delete(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT)).orElse(null);
    }

    /**
     * Creates an account for a first-time Google user. The password is random and unknown to anyone,
     * so the account can only be accessed through Google sign-in.
     */
    public User saveGoogleUser(String email, String name) {
        User user = new User();
        user.setUsername(uniqueUsername(name, email));
        user.setEmail(email.toLowerCase(Locale.ROOT));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    private String uniqueUsername(String name, String email) {
        String base = (name != null && !name.isBlank() ? name : email.substring(0, email.indexOf('@')))
                .replaceAll("[^A-Za-z0-9_.-]", "").toLowerCase(Locale.ROOT);
        if (base.length() < 3) base = "user" + base;
        if (base.length() > 24) base = base.substring(0, 24);
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    private User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public UserResponseDTO toDto(User user) {
        return new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}

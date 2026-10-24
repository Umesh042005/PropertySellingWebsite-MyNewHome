package com.property.property_selling.security;

import com.property.property_selling.model.User;
import com.property.property_selling.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Custom service implementation of Spring Security's UserDetailsService.
 * It is responsible for loading user-specific details from the database during authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    /**
     * Repository for performing CRUD operations and queries on the User entity.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Loads the user's data from the database using the username.
     * Converts the user's single role string into a list of GrantedAuthority to satisfy Spring Security's authorization requirements.
     *
     * @param username the username identifying the user whose data is required
     * @return a fully populated UserDetails object containing credentials and authorities
     * @throws UsernameNotFoundException if the user could not be found by their username
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole())
        );

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}
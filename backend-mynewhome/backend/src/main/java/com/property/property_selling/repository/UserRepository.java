package com.property.property_selling.repository;

import com.property.property_selling.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
/**
 * "A Spring Data JPA reposiory interface for the User entity,
 * where Long is the primary key type. Spring auto-generates the implementation at runtime."
 *Derived query method that fetches a User by username. Spring auto-generates SELECT * FROM users WHERE username = ? at runtime."
 */ 
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}

package com.property.property_selling.dto;
/**
 * UserResponseDTO wo class hai jo server se frontend ko data bhejti hai — register, login, ya koi bhi user-related response mein.
 * Isme id, username, email, role hain — lekin password bilkul nahi — ye security ke liye deliberately hataya gaya hai.
 * Ye Output DTO hai — pichle dono (Login + Registration) Input DTOs the, ye unka ulta hai.
 */
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String role;

/**
 * No-arg constructor — Jackson ke liye (agar kabhi Response JSON → Object banana pade)
 */
    public UserResponseDTO() {}
/**
 * Parameterized constructor
 */
    public UserResponseDTO(Long id, String username, String email, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

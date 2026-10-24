package com.property.property_selling.dto;

public class UserUpdateDTO {
    private String username;
    private String email;

    public UserUpdateDTO() {}

    public UserUpdateDTO(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // Getters & Setters
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
}
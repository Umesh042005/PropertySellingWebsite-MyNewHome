package com.property.property_selling.dto;

public class UserLoginDTO {
    private String username;
    private String password;

    // Constructo -->Jab bhi parameterized constructor likho — No-arg constructor manually likhna ZAROORI hai, warna Jackson JSON → Object convert nahi kar payega aur app crash ho jayegi!
    
    public UserLoginDTO() {}

    public UserLoginDTO(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters & Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

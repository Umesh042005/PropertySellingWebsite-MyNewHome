package com.property.property_selling.dto;
/**
 * It is class which is used to collect the new user registration deatails from front end.
 * and It is also used to send the response to the front end.
 * And this class is also known as DTO (Data Transfer Object).
 * Its only data carrier its only passing data to userService.
 */
public class UserRegistrationDTO {
    private String username;
    private String email;
    private String password;
    
/**
 * No-args constructor used by Jackson framework to convert JSON → Java object
 *  JSON → Object convert karne ke liye pehle khali object banana padta hai
 */
    public UserRegistrationDTO() {}

    public UserRegistrationDTO(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

/**
 * Getters — Jackson JSON banane ke liye use karta hai
 *  Setters — Jackson JSON se object fill karne ke liye use karta hai
*/
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

package com.property.property_selling.dto;

import org.springframework.web.multipart.MultipartFile;

/**
 * Input DTO for creating/updating a property, bound from multipart/form-data.
 * The image is required on create and optional on update.
 */
public class PropertyForm {
    private String title;
    private String description;
    private Double price;
    private String location;
    private String city;
    private String category;
    private String contact;
    private MultipartFile image;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}

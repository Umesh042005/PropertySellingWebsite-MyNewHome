package com.property.property_selling.model;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;
    private String description;
    private double price;
    private String location;
    private String category;

    @Lob
    private byte[] image;
    private String imageType;

    private String contact;
    private String city;

    // Owner field with JPA annotation
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    // Constructors
    public Property() {
    }

    public Property(long id, String title, String description, double price, String location, String category,
                    byte[] image, String imageType, String contact, String city, User owner) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.location = location;
        this.category = category;
        this.image = image;
        this.imageType = imageType;
        this.contact = contact;
        this.city = city;
        this.owner = owner;
    }

    //  Getters & Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public byte[] getImage() { return image; }
    public void setImage(byte[] image) { this.image = image; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}

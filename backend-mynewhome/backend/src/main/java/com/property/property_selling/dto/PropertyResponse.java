package com.property.property_selling.dto;

import java.time.Instant;

/**
 * Output DTO for a property listing. Built directly by JPQL queries so the image
 * bytes are never loaded for lists; the image is served from {@link #getImageUrl()}.
 */
public class PropertyResponse {
    private final long id;
    private final String title;
    private final String description;
    private final double price;
    private final String location;
    private final String city;
    private final String category;
    private final String contact;
    private final Long ownerId;
    private final String ownerUsername;
    private final Instant createdAt;
    private final Instant updatedAt;

    public PropertyResponse(long id, String title, String description, double price, String location,
                            String city, String category, String contact, Long ownerId,
                            String ownerUsername, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.location = location;
        this.city = city;
        this.category = category;
        this.contact = contact;
        this.ownerId = ownerId;
        this.ownerUsername = ownerUsername;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public String getLocation() { return location; }
    public String getCity() { return city; }
    public String getCategory() { return category; }
    public String getContact() { return contact; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerUsername() { return ownerUsername; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    /** Relative URL; the frontend prefixes it with the API base URL. */
    public String getImageUrl() { return "/api/properties/" + id + "/image"; }
}

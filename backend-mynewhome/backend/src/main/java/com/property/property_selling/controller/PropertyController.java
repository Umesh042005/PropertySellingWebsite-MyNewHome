package com.property.property_selling.controller;

import com.property.property_selling.dto.PropertyForm;
import com.property.property_selling.dto.PropertyResponse;
import com.property.property_selling.model.Property;
import com.property.property_selling.model.User;
import com.property.property_selling.service.PropertyService;
import com.property.property_selling.service.UserService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;
    private final UserService userService;

    public PropertyController(PropertyService propertyService, UserService userService) {
        this.propertyService = propertyService;
        this.userService = userService;
    }

    // Get all properties (public), optionally filtered by category and/or search keyword
    @GetMapping
    public List<PropertyResponse> getAllProperties(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return propertyService.search(category, search);
    }

    // Listings created by the logged-in user
    @GetMapping("/mine")
    public List<PropertyResponse> getMyProperties(@AuthenticationPrincipal UserDetails principal) {
        return propertyService.findByOwner(currentUser(principal));
    }

    // Get property by id (public)
    @GetMapping("/{id}")
    public PropertyResponse getPropertyById(@PathVariable long id) {
        return propertyService.get(id);
    }

    // Raw image bytes, so list responses stay small
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable long id) {
        Property property = propertyService.getWithImage(id);
        if (property.getImage() == null) return ResponseEntity.notFound().build();
        MediaType type = property.getImageType() != null
                ? MediaType.parseMediaType(property.getImageType())
                : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(type)
                // The frontend appends ?v=<updatedAt>, so a changed photo gets a new URL
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                .body(property.getImage());
    }

    // Create property (login required). "/upload" kept for backwards compatibility.
    @PostMapping(value = {"", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PropertyResponse> createProperty(
            @ModelAttribute PropertyForm form,
            @AuthenticationPrincipal UserDetails principal) {
        PropertyResponse created = propertyService.create(form, currentUser(principal));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Edit property (owner only). Image is optional; omit it to keep the current one.
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PropertyResponse editProperty(
            @PathVariable long id,
            @ModelAttribute PropertyForm form,
            @AuthenticationPrincipal UserDetails principal) {
        return propertyService.update(id, form, currentUser(principal));
    }

    // Delete property (owner only)
    @DeleteMapping("/{id}")
    public Map<String, String> deleteProperty(
            @PathVariable long id,
            @AuthenticationPrincipal UserDetails principal) {
        propertyService.delete(id, currentUser(principal));
        return Map.of("message", "Property deleted successfully");
    }

    private User currentUser(UserDetails principal) {
        return userService.getByUsername(principal.getUsername());
    }
}

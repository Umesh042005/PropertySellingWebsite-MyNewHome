package com.property.property_selling.controller;

import com.property.property_selling.model.Property;
import com.property.property_selling.model.User;
import com.property.property_selling.repository.PropertyRepository;
import com.property.property_selling.repository.UserRepository;
import com.property.property_selling.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.Base64;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    //  Get logged-in user from token
    private User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        return userRepository.findByUsername(username).orElse(null);
    }

    //  ADD Property (Correct endpoint = /upload)
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProperty(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String location,
            @RequestParam String category,
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam String city,
            @RequestParam String contact,
            @RequestHeader("Authorization") String authHeader
    ) {

        User currentUser = getUserFromToken(authHeader);
        if (currentUser == null) return ResponseEntity.status(401).body("Login required");

        try {
            Property property = new Property();
            property.setTitle(title);
            property.setDescription(description);
            property.setPrice(price);
            property.setLocation(location);
            property.setCategory(category);
            property.setImage(imageFile.getBytes());
            property.setImageType(imageFile.getContentType());
            property.setCity(city);
            property.setContact(contact);
            property.setOwner(currentUser);

            propertyRepository.save(property);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Property created successfully");
            response.put("id", property.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Get All Properties (Public)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllProperties(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<Property> properties;
        if (search != null && !search.isEmpty()) {
            properties = propertyRepository.findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(search, search);
        } else if (category != null && !category.equalsIgnoreCase("all")) {
            properties = propertyRepository.findByCategoryIgnoreCase(category);
        } else {
            properties = propertyRepository.findAll();
        }

        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Property p : properties) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("title", p.getTitle());
            item.put("price", p.getPrice());
            item.put("category", p.getCategory());
            item.put("location", p.getLocation());
            item.put("description", p.getDescription());
            item.put("contact", p.getContact());
            item.put("city", p.getCity());

            if (p.getImage() != null) {
                String base64Image = Base64.getEncoder().encodeToString(p.getImage());
                item.put("image", "data:" + p.getImageType() + ";base64," + base64Image);
            } else {
                item.put("image", null);
            }
            responseList.add(item);
        }
        return ResponseEntity.ok(responseList);
    }

    // Get Property By ID (Login Required)
    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User currentUser = getUserFromToken(authHeader);
        if (currentUser == null) {
            return ResponseEntity.status(401).body("Login required to view details");
        }

        Optional<Property> optional = propertyRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.notFound().build();

        Property property = optional.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", property.getId());
        response.put("title", property.getTitle());
        response.put("price", property.getPrice());
        response.put("category", property.getCategory());
        response.put("location", property.getLocation());
        response.put("description", property.getDescription());
        response.put("contact", property.getContact());
        response.put("city", property.getCity());

        if (property.getImage() != null) {
            String base64Image = Base64.getEncoder().encodeToString(property.getImage());
            response.put("image", "data:" + property.getImageType() + ";base64," + base64Image);
        } else {
            response.put("image", null);
        }

        return ResponseEntity.ok(response);
    }

    //  Delete Property (Login Required)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProperty(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        User currentUser = getUserFromToken(authHeader);
        if (currentUser == null) return ResponseEntity.status(401).body("Login required");

        Optional<Property> optional = propertyRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.status(404).body("Property not found");

        propertyRepository.delete(optional.get());
        return ResponseEntity.ok("Property deleted successfully");
    }

    //  Edit Property (Login Required)
    @PutMapping("/{id}")
    public ResponseEntity<?> editProperty(
            @PathVariable Long id,
            @RequestBody Property updatedProperty,
            @RequestHeader("Authorization") String authHeader) {

        User currentUser = getUserFromToken(authHeader);
        if (currentUser == null) return ResponseEntity.status(401).body("Login required");

        Optional<Property> optional = propertyRepository.findById(id);
        if (optional.isEmpty()) return ResponseEntity.status(404).body("Property not found");

        Property property = optional.get();
        property.setTitle(updatedProperty.getTitle());
        property.setDescription(updatedProperty.getDescription());
        property.setPrice(updatedProperty.getPrice());
        property.setLocation(updatedProperty.getLocation());
        property.setCategory(updatedProperty.getCategory());
        property.setCity(updatedProperty.getCity());
        property.setContact(updatedProperty.getContact());

        propertyRepository.save(property);
        return ResponseEntity.ok(property);
    }
}

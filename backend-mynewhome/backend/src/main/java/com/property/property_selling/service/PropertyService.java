package com.property.property_selling.service;

import com.property.property_selling.dto.PropertyForm;
import com.property.property_selling.dto.PropertyResponse;
import com.property.property_selling.exception.ApiException;
import com.property.property_selling.model.Property;
import com.property.property_selling.model.User;
import com.property.property_selling.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
public class PropertyService {

    /** Must stay in sync with CATEGORIES in frontend src/constants.js */
    public static final Set<String> CATEGORIES = Set.of(
            "Apartments", "Houses", "Land", "Commercial", "PG & Hostels", "Office", "Shops");

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> search(String category, String keyword) {
        String cat = blankToNull(category);
        if (cat != null && cat.equalsIgnoreCase("all")) cat = null;
        return propertyRepository.search(cat, blankToNull(keyword), null);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> findByOwner(User owner) {
        return propertyRepository.search(null, null, owner.getId());
    }

    @Transactional(readOnly = true)
    public PropertyResponse get(long id) {
        return propertyRepository.findSummaryById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
    }

    @Transactional(readOnly = true)
    public Property getWithImage(long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
    }

    @Transactional
    public PropertyResponse create(PropertyForm form, User owner) {
        if (form.getImage() == null || form.getImage().isEmpty()) {
            throw ApiException.badRequest("Please add a photo of the property");
        }
        Property property = new Property();
        applyFields(property, form);
        applyImage(property, form.getImage());
        property.setOwner(owner);
        propertyRepository.save(property);
        return get(property.getId());
    }

    @Transactional
    public PropertyResponse update(long id, PropertyForm form, User currentUser) {
        Property property = getWithImage(id);
        checkCanModify(property, currentUser);
        applyFields(property, form);
        if (form.getImage() != null && !form.getImage().isEmpty()) {
            applyImage(property, form.getImage());
        }
        propertyRepository.save(property);
        return get(id);
    }

    @Transactional
    public void delete(long id, User currentUser) {
        Property property = getWithImage(id);
        checkCanModify(property, currentUser);
        propertyRepository.delete(property);
    }

    /** Only the owner (or an admin) may edit or delete a listing. */
    private void checkCanModify(Property property, User user) {
        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole());
        boolean isOwner = property.getOwner() != null && property.getOwner().getId().equals(user.getId());
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("You can only change your own listings");
        }
    }

    private void applyFields(Property property, PropertyForm form) {
        String title = required(form.getTitle(), "Title");
        if (title.length() > 150) throw ApiException.badRequest("Title must be at most 150 characters");

        String description = required(form.getDescription(), "Description");
        if (description.length() > 5000) throw ApiException.badRequest("Description must be at most 5000 characters");

        if (form.getPrice() == null || form.getPrice() <= 0) {
            throw ApiException.badRequest("Price must be greater than 0");
        }

        String category = required(form.getCategory(), "Category");
        if (!CATEGORIES.contains(category)) throw ApiException.badRequest("Unknown category: " + category);

        String contact = required(form.getContact(), "Contact number").replaceAll("[\\s-]", "");
        if (!contact.matches("\\+?[0-9]{10,15}")) {
            throw ApiException.badRequest("Contact number must be 10-15 digits");
        }

        property.setTitle(title);
        property.setDescription(description);
        property.setPrice(form.getPrice());
        property.setCity(required(form.getCity(), "City"));
        property.setLocation(required(form.getLocation(), "Location"));
        property.setCategory(category);
        property.setContact(contact);
    }

    private void applyImage(Property property, MultipartFile image) {
        String type = image.getContentType();
        if (type == null || !type.startsWith("image/")) {
            throw ApiException.badRequest("Only image files can be uploaded");
        }
        if (image.getSize() > MAX_IMAGE_BYTES) {
            throw ApiException.badRequest("Image is too large. Maximum size is 5 MB");
        }
        try {
            property.setImage(image.getBytes());
            property.setImageType(type);
        } catch (IOException e) {
            throw ApiException.badRequest("Could not read the uploaded image");
        }
    }

    private static String required(String value, String field) {
        if (value == null || value.isBlank()) throw ApiException.badRequest(field + " is required");
        return value.trim();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

//package com.property.property_selling.service;
//
//import com.property.property_selling.model.Property;
//import com.property.property_selling.repository.PropertyRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class PropertyService {
//
//    @Autowired
//    private PropertyRepository propertyRepository;
//
//    // ✅ Save a property
//    public Property addProperty(Property property) {
//        return propertyRepository.save(property);
//    }
//
//    // ✅ Get all properties
//    public List<Property> getAllProperties() {
//        return propertyRepository.findAll();
//    }
//
//    // ✅ Get property by ID
//    public Property getPropertyById(Long id) {
//        return propertyRepository.findById(id).orElse(null);
//    }
//
//    // ✅ Filter properties by price range
//    public List<Property> getPropertiesByPriceRange(double min, double max) {
//        return propertyRepository.findByPriceBetween(min, max);
//    }
//
//    // ✅ Filter properties by type (like 'land', 'plot', etc.)
//    public List<Property> getPropertiesByType(String category) {
//        return propertyRepository.findByCategoryIgnoreCase(category);
//    }
//
//    // ✅ Update property by ID
//    public Property updateProperty(Long id, Property updatedProperty) {
//        Property existingProperty = propertyRepository.findById(id).orElse(null);
//
//        if (existingProperty != null) {
//            existingProperty.setTitle(updatedProperty.getTitle());
//            existingProperty.setDescription(updatedProperty.getDescription());
//            existingProperty.setPrice(updatedProperty.getPrice());
//            existingProperty.setLocation(updatedProperty.getLocation());
//            existingProperty.setCategory(updatedProperty.getCategory());  // ✅ FIXED
//            existingProperty.setImageUrl(updatedProperty.getImageUrl());  // ✅ FIXED
//            return propertyRepository.save(existingProperty);
//        }
//
//        return null;
//    }
//
//
//    // ✅ Delete property by ID
//    public boolean deleteProperty(Long id) {
//        if (propertyRepository.existsById(id)) {
//            propertyRepository.deleteById(id);
//            return true;
//        }
//        return false;
//    }
//
//    // ✅ Search properties by title or location
//    public List<Property> searchProperties(String keyword) {
//        return propertyRepository.findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(keyword, keyword);
//    }
//}

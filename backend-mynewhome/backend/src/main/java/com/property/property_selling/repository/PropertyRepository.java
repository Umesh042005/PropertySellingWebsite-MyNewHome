package com.property.property_selling.repository;

import com.property.property_selling.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    //  Filter by price range
    List<Property> findByPriceBetween(double minPrice, double maxPrice);

    // Filter by category
    List<Property> findByCategoryIgnoreCase(String category);

    // Search by title OR location (case-insensitive)
    List<Property> findByTitleContainingIgnoreCaseOrLocationContainingIgnoreCase(String titleKeyword, String locationKeyword);

    //  Full text-like search (title, description, location, category)
    @Query("SELECT p FROM Property p " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.location) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Property> searchProperties(@Param("keyword") String keyword);
}

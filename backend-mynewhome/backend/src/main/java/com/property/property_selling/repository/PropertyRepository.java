package com.property.property_selling.repository;

import com.property.property_selling.dto.PropertyResponse;
import com.property.property_selling.model.Property;
import com.property.property_selling.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    String SUMMARY_SELECT = "select new com.property.property_selling.dto.PropertyResponse(" +
            "p.id, p.title, p.description, p.price, p.location, p.city, p.category, p.contact, " +
            "o.id, o.username, p.createdAt, p.updatedAt) " +
            "from Property p left join p.owner o ";

    /**
     * Search listings without loading image bytes. Every filter is optional (pass null to skip).
     * The keyword matches title, location, city or description (case-insensitive).
     */
    @Query(SUMMARY_SELECT +
            "where (:category is null or lower(p.category) = lower(:category)) " +
            "and (:ownerId is null or o.id = :ownerId) " +
            "and (:keyword is null " +
            "  or lower(p.title) like lower(concat('%', :keyword, '%')) " +
            "  or lower(p.location) like lower(concat('%', :keyword, '%')) " +
            "  or lower(p.city) like lower(concat('%', :keyword, '%')) " +
            "  or lower(p.description) like lower(concat('%', :keyword, '%'))) " +
            "order by p.id desc")
    List<PropertyResponse> search(@Param("category") String category,
                                  @Param("keyword") String keyword,
                                  @Param("ownerId") Long ownerId);

    @Query(SUMMARY_SELECT + "where p.id = :id")
    Optional<PropertyResponse> findSummaryById(@Param("id") long id);

    void deleteByOwner(User owner);
}

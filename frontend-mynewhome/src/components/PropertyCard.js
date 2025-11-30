// src/components/PropertyCard.js
import React from "react";
import { Link } from "react-router-dom";
import "./PropertyCard.css";

export default function PropertyCard({ property, variant = "grid" }) {
  const { id, title, price, city, category, image, location, description } = property;

  const formatPrice = (num) => {
    const numericPrice = Number(num);
    return Number.isNaN(numericPrice) ? "On request" : numericPrice.toLocaleString("en-IN");
  };

  const defaultImage = "https://via.placeholder.com/600x400?text=Property";
  const categoryLabel = category || "Featured";
  const locationLabel = city || location || "Location to be confirmed";
  const descriptionSnippet = description
    ? `${description.slice(0, 120)}${description.length > 120 ? "…" : ""}`
    : null;

  return (
    <article className={`property-card ${variant === "list" ? "property-card--list" : ""}`}>
      <div className="property-card__image-wrapper">
        <img 
          src={image || defaultImage} 
          alt={title || "Property Image"} 
          className="property-card__image"
        />
        <span className="property-card__category-badge">{categoryLabel}</span>
      </div>
      
      <div className="property-card__content">
        <div className="property-card__header">
          <h3 className="property-card__title">{title || "Property"}</h3>
          {category && (
            <span className="property-card__category-text">{category}</span>
          )}
        </div>
        
        {descriptionSnippet && (
          <p className="property-card__description">{descriptionSnippet}</p>
        )}
        
        <div className="property-card__footer">
          <div className="property-card__location-info">
            <span className="property-card__location">{locationLabel}</span>
            {price && (
              <span className="property-card__price">₹{formatPrice(price)}</span>
            )}
          </div>
          <Link to={`/property/${id}`} className="property-card__view-btn">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

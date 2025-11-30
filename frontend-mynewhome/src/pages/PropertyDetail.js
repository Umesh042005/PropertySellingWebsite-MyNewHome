// src/pages/PropertyDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PropertyDetail.css";

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    // Try with auth first if token exists, otherwise try without
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    axios
      .get(`http://localhost:8080/api/properties/${id}`, { headers })
      .then((res) => {
        setProperty(res.data);
        setLoading(false);
      })
      .catch((err) => {
        // If 401 with token, try without token
        if (err.response?.status === 401 && token) {
          axios
            .get(`http://localhost:8080/api/properties/${id}`)
            .then((res) => {
              setProperty(res.data);
              setLoading(false);
            })
            .catch((err2) => {
              console.error("Error fetching property:", err2);
              setLoading(false);
              // Don't navigate away, just show error
            });
        } else {
          console.error("Error fetching property:", err);
          setLoading(false);
        }
      });
  }, [id]);

  const handleDelete = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required to delete property");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this property?")) return;

    axios
      .delete(`http://localhost:8080/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Property deleted successfully");
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/");
        } else {
          alert("Error deleting property");
        }
      });
  };

  const formatPrice = (num) => {
    const numericPrice = Number(num);
    return Number.isNaN(numericPrice) ? "N/A" : numericPrice.toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="property-detail-loading">
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="property-detail-not-found">
            <p>Property not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBackdropClick = (e) => {
    // Navigate back when clicking outside the card
    if (e.target === e.currentTarget) {
      navigate(-1);
    }
  };

  return (
    <div className="property-detail-page" onClick={handleBackdropClick}>
      <div className="property-detail-container" onClick={(e) => e.stopPropagation()}>
        <div className="property-detail-card">
          <div className="property-detail-hero">
            <img
              src={property.image || "https://via.placeholder.com/1100x500?text=No+Image"}
              alt={property.title}
            />
            {property.category && (
              <span className="property-detail-badge">
                {property.category}
              </span>
            )}
          </div>
          
          <div className="property-detail-content">
            <div className="property-detail-header">
              <h1 className="property-detail-title">{property.title}</h1>
              <div className="property-detail-price-section">
                <p className="property-detail-price">₹{formatPrice(property.price)}</p>
                {property.city && (
                  <div className="property-detail-location">
                    {property.city}{property.location ? `, ${property.location}` : ""}
                  </div>
                )}
              </div>
            </div>

            {property.description && (
              <div className="property-detail-description">
                <h4>About this property</h4>
                <p>{property.description}</p>
              </div>
            )}

            <div className="property-detail-features">
              {property.category && (
                <div className="property-detail-feature">
                  <p className="property-detail-feature-label">Category</p>
                  <p className="property-detail-feature-value">{property.category}</p>
                </div>
              )}
              {property.bedrooms && (
                <div className="property-detail-feature">
                  <p className="property-detail-feature-label">Bedrooms</p>
                  <p className="property-detail-feature-value">{property.bedrooms}</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="property-detail-feature">
                  <p className="property-detail-feature-label">Bathrooms</p>
                  <p className="property-detail-feature-value">{property.bathrooms}</p>
                </div>
              )}
              {property.area && (
                <div className="property-detail-feature">
                  <p className="property-detail-feature-label">Area</p>
                  <p className="property-detail-feature-value">{property.area} sq.ft.</p>
                </div>
              )}
            </div>

            {property.contact && (
              <div className="property-detail-contact">
                <p>
                  <strong>Contact:</strong> {property.contact}
                </p>
              </div>
            )}

            <div className="property-detail-actions">
              {isAuthenticated && (
                <>
                  <button 
                    className="property-detail-btn property-detail-btn-primary"
                    onClick={() => navigate(`/edit-property/${id}`)}
                  >
                    <span className="btn-icon">✏️</span>
                    Edit Property
                  </button>
                  <button 
                    className="property-detail-btn property-detail-btn-danger"
                    onClick={handleDelete}
                  >
                    <span className="btn-icon">🗑️</span>
                    Delete Property
                  </button>
                </>
              )}
              <button 
                className="property-detail-btn property-detail-btn-secondary"
                onClick={() => navigate(-1)}
              >
                <span className="btn-icon">←</span>
                Back to Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;

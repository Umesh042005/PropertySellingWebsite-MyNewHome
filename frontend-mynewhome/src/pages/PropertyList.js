// src/pages/PropertyList.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import { useParams, useLocation } from "react-router-dom";
import "./PropertyList.css";

function PropertyList() {
  const { category } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const keyword = queryParams.get("search");

  const [properties, setProperties] = useState([]);
  const [sortOption, setSortOption] = useState("recommended");
  const [viewMode, setViewMode] = useState("grid");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    let url = "http://localhost:8080/api/properties";

    if (category) {
      url += `?category=${category}`;
    } else if (keyword) {
      url += `?search=${keyword}`;
    }

    axios
      .get(url)
      .then((res) => setProperties(res.data))
      .catch((err) => console.error("Error fetching properties:", err));
  }, [category, keyword]);

  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const numericPrice = Number(item.price) || 0;
      const withinMin = minPrice ? numericPrice >= Number(minPrice) : true;
      const withinMax = maxPrice ? numericPrice <= Number(maxPrice) : true;
      return withinMin && withinMax;
    });
  }, [properties, minPrice, maxPrice]);

  const sortedProperties = useMemo(() => {
    const next = [...filteredProperties];

    if (sortOption === "price-asc") {
      next.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }

    if (sortOption === "price-desc") {
      next.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    if (sortOption === "city") {
      next.sort((a, b) => (a.city || "").localeCompare(b.city || ""));
    }

    return next;
  }, [filteredProperties, sortOption]);

  const numericPrices = useMemo(() => {
    return filteredProperties
      .map((item) => Number(item.price))
      .filter((price) => !Number.isNaN(price) && price > 0);
  }, [filteredProperties]);

  const averagePrice = useMemo(() => {
    if (!numericPrices.length) return null;
    const total = numericPrices.reduce((acc, price) => acc + price, 0);
    return Math.round(total / numericPrices.length);
  }, [numericPrices]);

  const uniqueCities = useMemo(() => {
    return new Set(filteredProperties.map((item) => item.city).filter(Boolean)).size;
  }, [filteredProperties]);

  const heroTitle = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Properties`
    : keyword
    ? `Search Results for "${keyword}"`
    : "Property Listings";

  const heroSubtitle = category
    ? `Browse available ${category.toLowerCase()} properties`
    : keyword
    ? `Found ${sortedProperties.length} properties matching your search`
    : `Showing ${sortedProperties.length} properties`;

  return (
    <section className="listing-page">
      <div className="container listing-page__container">
        <header className="listing-hero">
          <div>
            <p className="eyebrow">MyNewHome· Listings</p>
            <h2>{heroTitle}</h2>
            <p className="subtitle">{heroSubtitle}</p>
          </div>

          <div className="listing-hero__stats">
            <div>
              <p className="stat-value">{sortedProperties.length}</p>
              <p className="stat-label">Active listings</p>
            </div>
            <div>
              <p className="stat-value">
                {averagePrice ? `₹${averagePrice.toLocaleString("en-IN")}` : "—"}
              </p>
              <p className="stat-label">Avg. price</p>
            </div>
            <div>
              <p className="stat-value">{uniqueCities || "—"}</p>
              <p className="stat-label">Cities covered</p>
            </div>
          </div>
        </header>

        <div className="listing-controls">
          <div className="filters-panel">
            <label>
              <span>Min price</span>
              <input
                type="number"
                placeholder="₹5,00,000"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </label>
            <label>
              <span>Max price</span>
              <input
                type="number"
                placeholder="₹5,00,00,000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </label>
            <label>
              <span>Sort by</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price · Low to high</option>
                <option value="price-desc">Price · High to low</option>
                <option value="city">City</option>
              </select>
            </label>
          </div>

          <div className="view-toggle" role="group" aria-label="Change layout">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              Grid
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              List
            </button>
          </div>
        </div>

        {sortedProperties.length === 0 ? (
          <div className="empty-state">
            <p>No properties match these filters.</p>
            <button type="button" onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              setSortOption("recommended");
            }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className={`listing-grid ${viewMode === "list" ? "listing-grid--list" : ""}`}>
            {sortedProperties.map((property) => (
              <PropertyCard
                key={property.id || property.title}
                property={property}
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PropertyList;

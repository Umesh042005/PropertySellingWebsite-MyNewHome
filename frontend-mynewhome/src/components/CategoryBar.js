import React from "react";
import { Link } from "react-router-dom";
import "./CategoryBar.css";

const categories = [
  { label: "All", slug: "" },
  { label: "Apartments", slug: "apartments" },
  { label: "Houses", slug: "houses" },
  { label: "Land", slug: "land" },
  { label: "Commercial", slug: "commercial" },
  { label: "PG & Hostels", slug: "pg-hostels" },
  { label: "Office", slug: "office" },
  { label: "Shops", slug: "shops" },
];

export default function CategoryBar() {
  return (
    <div className="category-bar">
      {categories.map((cat, index) => (
        <Link
          key={index}
          to={cat.slug ? `/properties/${cat.slug}` : "/"} 
          className="category-btn"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

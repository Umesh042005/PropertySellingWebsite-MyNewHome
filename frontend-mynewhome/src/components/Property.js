// src/components/Property.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import PropertyCard from "./PropertyCard"; // reuse your card

export default function Property() {
  const [property, setProperty] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [properties, setProperties] = useState([]);

  // Fetch properties on load
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/properties");
      setProperties(res.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // preview image before upload
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", property.title);
    formData.append("description", property.description);
    formData.append("price", property.price);
    formData.append("location", property.location);
    formData.append("type", property.type);
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:8080/api/properties", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Property uploaded successfully!");
      setProperty({ title: "", description: "", price: "", location: "", type: "" });
      setImage(null);
      setPreview(null);
      fetchProperties(); // refresh list
    } catch (error) {
      console.error("Error uploading property:", error);
      alert("Error uploading property");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Add Property</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={property.title}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={property.description}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={property.price}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={property.location}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          type="text"
          name="type"
          placeholder="Type (Apartment, Plot, etc.)"
          value={property.type}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-control mb-2"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
          />
        )}

        <button type="submit" className="btn btn-success mt-3">
          Upload Property
        </button>
      </form>

      <h2 className="mb-3">Available Properties</h2>
      <div className="d-flex flex-wrap">
        {properties.map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </div>
  );
}

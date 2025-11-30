import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProperty.css";

const showAlert = (message) => {
  alert(message);
};

function AddProperty({ token }) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // AI description loading
  const navigate = useNavigate();

  const [property, setProperty] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    location: "",
    category: "",
    contact: "",
  });
  const [image, setImage] = useState(null);

  const categories = [
    "Apartments",
    "Houses",
    "Land",
    "Commercial",
    "PG & Hostels",
    "Office",
    "Shops",
  ];

  const cityOptions = {
    Bhopal: ["Hoshangabad Road", "Indrapuri", "Arera Colony"],
    Indore: ["Vijay Nagar", "MG Road", "Palasia"],
    Delhi: ["Laxmi Nagar", "Dwarka", "Rohini"],
    Mumbai: ["Bandra", "Andheri", "Juhu"],
    Pune: ["Baner", "Kothrud", "Viman Nagar"],
    Bangalore: ["Electronic City", "Whitefield", "MG Road"],
  };

  const handleChange = (e) => {
    setProperty({
      ...property,
      [e.target.name]: e.target.value,
      ...(e.target.name === "city" && { location: "" }),
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // --- AI Description Generator ---
  const handleGenerateDescription = async () => {
    if (!property.title) {
      showAlert("Please enter a title first for AI to generate description.");
      return;
    }

    setAiLoading(true);
    try {
      const currentToken = token || localStorage.getItem("token");
      if (!currentToken) {
        showAlert("❌ Unauthorized: Please login first.");
        setAiLoading(false);
        return;
      }

      // Backend Gemini API call
      const res = await fetch(
        `http://localhost:8080/api/gemini/generate?prompt=Generate a detailed property description for: "${property.title}"`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!res.ok) {
        showAlert(`AI Error: ${res.status} ${res.statusText}`);
        setAiLoading(false);
        return;
      }

      const aiDescription = await res.text();
      setProperty((prev) => ({
        ...prev,
        description: aiDescription,
      }));
    } catch (err) {
      console.error(err);
      showAlert("Network Error while generating AI description.");
    }
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      showAlert("❌ Unauthorized: Please login first.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.keys(property).forEach((key) => formData.append(key, property[key]));
    if (image) formData.append("image", image);
    formData.set("price", Number(property.price));

    try {
      const res = await fetch("http://localhost:8080/api/properties/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        body: formData,
      });

      setLoading(false);

      if (res.status === 401 || res.status === 403) {
        showAlert("❌ Unauthorized: Session expired or no permission.");
        return;
      }

      const responseBody = await res.json();
      if (res.ok) {
        showAlert(`✅ Property "${property.title}" added successfully!`);
        setProperty({
          title: "",
          description: "",
          price: "",
          city: "",
          location: "",
          category: "",
          contact: "",
        });
        setImage(null);
        navigate("/my-ads");
      } else {
        showAlert(`❌ Error: ${responseBody.message || res.statusText}`);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      showAlert("Network Error: Could not connect to server.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate(-1);
    }
  };

  return (
    <div className="add-property-page" onClick={handleBackdropClick}>
      <div className="add-property-container" onClick={(e) => e.stopPropagation()}>
        <div className="add-property-header">
          <h1 className="add-property-title">Add New Property</h1>
          <p className="add-property-subtitle">List your property for sale or rent</p>
        </div>

        <form onSubmit={handleSubmit} className="add-property-form">
          {/* Title */}
          <div className="add-property-form-group">
            <label className="add-property-label">Property Title</label>
            <input
              type="text"
              name="title"
              value={property.title}
              onChange={handleChange}
              className="add-property-input"
              required
              placeholder="E.g., Spacious 2BHK Flat near MG Road"
            />
          </div>

          {/* Description */}
          <div className="add-property-form-group">
            <label className="add-property-label">Description</label>
            <textarea
              name="description"
              value={property.description}
              onChange={handleChange}
              className="add-property-textarea"
              required
              placeholder="Property details..."
            ></textarea>
            <button
              type="button"
              className="add-property-ai-button"
              onClick={handleGenerateDescription}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <span className="add-property-spinner"></span>
                  Generating...
                </>
              ) : (
                "Generate AI Description"
              )}
            </button>
          </div>

          {/* Price & Contact */}
          <div className="add-property-row">
            <div className="add-property-form-group">
              <label className="add-property-label">Price (INR)</label>
              <input
                type="number"
                name="price"
                value={property.price}
                onChange={handleChange}
                className="add-property-input"
                required
                min="1000"
                max="100000000"
                placeholder="Price in INR"
              />
            </div>
            <div className="add-property-form-group">
              <label className="add-property-label">Contact Number</label>
              <input
                type="text"
                name="contact"
                value={property.contact}
                onChange={handleChange}
                className="add-property-input"
                required
                pattern="[0-9]{10,15}"
                placeholder="E.g., 9876543210"
              />
            </div>
          </div>

          {/* City / Location / Category */}
          <div className="add-property-row">
            <div className="add-property-form-group">
              <label className="add-property-label">City</label>
              <select
                name="city"
                value={property.city}
                onChange={handleChange}
                className="add-property-select"
                required
              >
                <option value="">-- Select City --</option>
                {Object.keys(cityOptions).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="add-property-form-group">
              <label className="add-property-label">Location</label>
              <select
                name="location"
                value={property.location}
                onChange={handleChange}
                className="add-property-select"
                required
                disabled={!property.city}
              >
                <option value="">-- Select Location --</option>
                {property.city &&
                  cityOptions[property.city].map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
              </select>
            </div>

            <div className="add-property-form-group">
              <label className="add-property-label">Category</label>
              <select
                name="category"
                value={property.category}
                onChange={handleChange}
                className="add-property-select"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image */}
          <div className="add-property-form-group">
            <label className="add-property-label">Property Image</label>
            <div className="add-property-file-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="add-property-file-input"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="add-property-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="add-property-spinner"></span>
                Adding Property...
              </>
            ) : (
              "Add Property"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProperty;

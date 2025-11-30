import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditProperty() {
  const { id } = useParams(); // property id from URL
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

  // Fetch property data by id
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/properties/${id}`)
      .then((res) => {
        setProperty(res.data);
      })
      .catch((err) => {
        console.error("Error fetching property:", err);
        alert("Error fetching property details!");
      });
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", property.title);
      formData.append("description", property.description);
      formData.append("price", property.price);
      formData.append("city", property.city);
      formData.append("location", property.location);
      formData.append("category", property.category);
      formData.append("contact", property.contact);
      if (image) formData.append("image", image);

      await axios.put(
        `http://localhost:8080/api/properties/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Property updated successfully!");
      navigate(`/property/${id}`);
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Error updating property!");
    }
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <div className="container mt-4" style={{
        backgroundColor: '#1a1a1a',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ color: '#ffffff', marginBottom: '2rem' }}>Edit Property</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Title</label>
            <input
              type="text"
              name="title"
              value={property.title || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Description</label>
            <textarea
              name="description"
              value={property.description || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Price (INR)</label>
            <input
              type="number"
              name="price"
              value={property.price || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>City</label>
            <select
              name="city"
              value={property.city || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">-- Select City --</option>
              {Object.keys(cityOptions).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Location</label>
            <select
              name="location"
              value={property.location || ""}
              onChange={handleChange}
              className="form-control"
              required
              disabled={!property.city}
            >
              <option value="">-- Select Location --</option>
              {property.city &&
                cityOptions[property.city].map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Category</label>
            <select
              name="category"
              value={property.category || ""}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Contact Number</label>
            <input
              type="text"
              name="contact"
              value={property.contact || ""}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#ffffff' }}>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
          </div>

          <button type="submit" className="btn btn-success mt-3">
            Update Property
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProperty;

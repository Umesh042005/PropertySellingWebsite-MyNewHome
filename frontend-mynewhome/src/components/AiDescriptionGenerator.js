// src/components/AiDescriptionGenerator.jsx
import React, { useState } from "react";
import axios from "axios";
import { Button, Form, Spinner } from "react-bootstrap";

const AiDescriptionGenerator = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!value || value.trim() === "") {
      alert("Please enter some details first!");
      return;
    }

    setLoading(true);

    try {
      // Call your backend Gemini API
      const response = await axios.get(
        `http://localhost:8080/api/gemini/generate`,
        { params: { prompt: value } }
      );

      // AI-generated text
      const aiText = response.data;
          const shortDesc = aiText.split(". ").slice(0, 3).join(". ") + ".";


      // Update parent state
      onChange(aiText);

    } catch (error) {
      console.error("Error generating AI description:", error);
      alert("AI generation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form.Label>Property Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={5}
        placeholder="Enter description details here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-2">
        <Button variant="secondary" onClick={handleGenerate} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Generate AI Description"}
        </Button>
      </div>
    </div>
  );
};

export default AiDescriptionGenerator;

package com.property.property_selling.service;

import org.springframework.beans.factory.annotation.Value; // 🛑 NAYA IMPORT
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

@Service
public class GeminiService {

    // REMOVE: private static final String API_KEY = "AIzaSyAl47K-Ht4A4ePlsG8Ug1XTIvrmM3LmUq4";

    //  FIX: Key ko properties file se load karein
    @Value("${gemini.api.key}")
    private String API_KEY;

    // URL ko ek method mein rakhein, taaki woh injected key use kar sake
    private String getGeminiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;
    }

    public String generateResponse(String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Create request body (logic is correct)
            JSONObject content = new JSONObject();
            JSONArray parts = new JSONArray()
                    .put(new JSONObject().put("text", prompt));
            JSONArray contents = new JSONArray()
                    .put(new JSONObject().put("parts", parts));
            content.put("contents", contents);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(content.toString(), headers);

            // Call Gemini API (using the method to get URL)
            ResponseEntity<String> response = restTemplate.postForEntity(getGeminiUrl(), request, String.class);

            // Parse response (logic is correct)
            JSONObject jsonResponse = new JSONObject(response.getBody());
            return jsonResponse
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
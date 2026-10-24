package com.property.property_selling.service;

import com.property.property_selling.exception.ApiException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // Key is loaded from the GEMINI_API_KEY env var, never hardcoded
    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(45))
                .build();
    }

    /** Builds the prompt on the server so the endpoint can't be used as a free general-purpose chatbot. */
    public String generateListingDescription(String title, String category, String city, String location) {
        if (title == null || title.isBlank()) {
            throw ApiException.badRequest("Enter a title first");
        }
        StringBuilder prompt = new StringBuilder()
                .append("Write an appealing, honest real-estate listing description of 80-120 words. ")
                .append("Plain text only: no markdown, no headings, no bullet points, no emojis. ")
                .append("Do not invent specific numbers such as area, price or number of rooms.\n")
                .append("Title: ").append(limit(title)).append('\n');
        if (category != null && !category.isBlank()) prompt.append("Type: ").append(limit(category)).append('\n');
        if (location != null && !location.isBlank()) prompt.append("Locality: ").append(limit(location)).append('\n');
        if (city != null && !city.isBlank()) prompt.append("City: ").append(limit(city)).append('\n');
        return generate(prompt.toString());
    }

    private String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AI descriptions are not configured on this server");
        }
        try {
            JSONObject body = new JSONObject().put("contents", new JSONArray()
                    .put(new JSONObject().put("parts", new JSONArray()
                            .put(new JSONObject().put("text", prompt)))));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    URL, new HttpEntity<>(body.toString(), headers), String.class);

            return new JSONObject(response.getBody())
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")
                    .trim();
        } catch (Exception e) {
            log.error("Gemini request failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI service is unavailable right now. Please try again.");
        }
    }

    private static String limit(String value) {
        String v = value.trim();
        return v.length() > 200 ? v.substring(0, 200) : v;
    }
}

package com.property.property_selling.controller;

import com.property.property_selling.service.GeminiService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Login required (see SecurityConfig) so the AI quota can't be used anonymously
@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Body: { title, category, city, location } -> { description }
    @PostMapping("/description")
    public Map<String, String> generateDescription(@RequestBody Map<String, String> body) {
        String description = geminiService.generateListingDescription(
                body.get("title"), body.get("category"), body.get("city"), body.get("location"));
        return Map.of("description", description);
    }
}

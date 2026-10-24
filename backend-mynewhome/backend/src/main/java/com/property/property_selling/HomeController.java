package com.property.property_selling;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Health check used by Docker / hosting platforms
@RestController
public class HomeController {

    @GetMapping({"/", "/api/health"})
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "MyNewHome API");
    }
}

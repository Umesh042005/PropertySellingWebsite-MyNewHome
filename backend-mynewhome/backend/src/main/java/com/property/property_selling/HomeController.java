package com.property.property_selling;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")    public String home() {
        return "Welcome to Property Selling Website 🚀";
    }
}

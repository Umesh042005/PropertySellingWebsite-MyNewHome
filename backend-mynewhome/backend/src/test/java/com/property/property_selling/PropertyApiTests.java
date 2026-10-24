package com.property.property_selling;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PropertyApiTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    private String register(String username) throws Exception {
        String body = """
                {"username":"%s","email":"%s@example.com","password":"secret123"}
                """.formatted(username, username);
        String json = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(json).get("token").asText();
    }

    private MockMultipartHttpServletRequestBuilder propertyForm(MockMultipartHttpServletRequestBuilder req) {
        req.file(new MockMultipartFile("image", "house.png", "image/png", new byte[]{1, 2, 3}));
        req.param("title", "Sunny 2BHK")
                .param("description", "A bright apartment close to the metro.")
                .param("price", "4500000")
                .param("city", "Pune")
                .param("location", "Baner")
                .param("category", "Apartments")
                .param("contact", "9876543210");
        return req;
    }

    @Test
    void ownerCanManageListingAndOthersCannot() throws Exception {
        String owner = register("owner" + UUID.randomUUID().toString().substring(0, 6));
        String other = register("other" + UUID.randomUUID().toString().substring(0, 6));

        String created = mvc.perform(propertyForm(multipart("/api/properties"))
                        .header("Authorization", "Bearer " + owner))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Sunny 2BHK"))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = mapper.readTree(created);
        long id = node.get("id").asLong();

        // Public reads, filtered by category, image served separately
        mvc.perform(get("/api/properties").param("category", "apartments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")]").exists());
        mvc.perform(get("/api/properties/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("/api/properties/" + id + "/image"));
        mvc.perform(get("/api/properties/" + id + "/image"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));

        // Another user cannot delete or edit it
        mvc.perform(delete("/api/properties/" + id).header("Authorization", "Bearer " + other))
                .andExpect(status().isForbidden());
        MockMultipartHttpServletRequestBuilder edit = multipart("/api/properties/" + id);
        edit.with(r -> { r.setMethod("PUT"); return r; });
        mvc.perform(propertyForm(edit).header("Authorization", "Bearer " + other))
                .andExpect(status().isForbidden());

        // Anonymous users cannot create
        mvc.perform(propertyForm(multipart("/api/properties"))).andExpect(status().isUnauthorized());

        // Owner sees it in "mine" and can delete it
        mvc.perform(get("/api/properties/mine").header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(delete("/api/properties/" + id).header("Authorization", "Bearer " + owner))
                .andExpect(status().isOk());
        mvc.perform(get("/api/properties/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void validationAndAuthErrorsAreJson() throws Exception {
        String token = register("val" + UUID.randomUUID().toString().substring(0, 6));

        MockMultipartHttpServletRequestBuilder req = multipart("/api/properties");
        req.file(new MockMultipartFile("image", "x.png", "image/png", new byte[]{1}));
        mvc.perform(req.param("title", "No price").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"nobody\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid username or password"));

        mvc.perform(get("/api/user")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/user").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/user/me").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
    }

    @Test
    void loginWorksWithEmail() throws Exception {
        String name = "mail" + UUID.randomUUID().toString().substring(0, 6);
        register(name);
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + name + "@example.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value(name));
    }
}

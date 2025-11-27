package com.warehouse.inventory.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.inventory.dto.request.CreateWarehouseRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class WarehouseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullWarehouseLifecycle_ShouldWorkEndToEnd() throws Exception {
        // Create warehouse
        CreateWarehouseRequest createRequest = new CreateWarehouseRequest();
        createRequest.setName("Integration Test Warehouse");
        createRequest.setLocation("Test City");
        createRequest.setDescription("Integration test warehouse");
        createRequest.setCapacity(50000);

        String createResponse = mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Integration Test Warehouse"))
                .andExpect(jsonPath("$.location").value("Test City"))
                .andReturn().getResponse().getContentAsString();

        Long warehouseId = objectMapper.readTree(createResponse).get("id").asLong();

        // Get warehouse by ID
        mockMvc.perform(get("/api/warehouses/" + warehouseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(warehouseId))
                .andExpect(jsonPath("$.name").value("Integration Test Warehouse"));

        // Update warehouse
        CreateWarehouseRequest updateRequest = new CreateWarehouseRequest();
        updateRequest.setName("Updated Warehouse");
        updateRequest.setLocation("Updated City");
        updateRequest.setDescription("Updated description");
        updateRequest.setCapacity(75000);

        mockMvc.perform(put("/api/warehouses/" + warehouseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Warehouse"))
                .andExpect(jsonPath("$.location").value("Updated City"));

        // Get all warehouses
        mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Delete warehouse
        mockMvc.perform(delete("/api/warehouses/" + warehouseId))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/warehouses/" + warehouseId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWarehouse_WithDuplicateName_ShouldReturnConflict() throws Exception {
        CreateWarehouseRequest request = new CreateWarehouseRequest();
        request.setName("Duplicate Warehouse");
        request.setLocation("Location");
        request.setCapacity(10000);

        // Create first warehouse
        mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Try to create duplicate
        mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already exists")));
    }

    @Test
    void createWarehouse_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        CreateWarehouseRequest request = new CreateWarehouseRequest();
        request.setName(""); // Invalid empty name

        mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}

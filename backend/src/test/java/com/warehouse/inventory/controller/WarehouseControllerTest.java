package com.warehouse.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.inventory.dto.request.CreateWarehouseRequest;
import com.warehouse.inventory.dto.response.WarehouseResponse;
import com.warehouse.inventory.service.WarehouseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WarehouseController.class)
class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WarehouseService warehouseService;

    @Test
    void createWarehouse_ShouldReturnCreatedWarehouse() throws Exception {
        CreateWarehouseRequest request = new CreateWarehouseRequest();
        request.setName("Main Warehouse");
        request.setLocation("New York");
        request.setCapacity(10000);

        WarehouseResponse response = WarehouseResponse.builder()
                .id(1L)
                .name("Main Warehouse")
                .location("New York")
                .capacity(10000)
                .currentOccupancy(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(warehouseService.createWarehouse(any(CreateWarehouseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/warehouses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Main Warehouse"))
                .andExpect(jsonPath("$.location").value("New York"))
                .andExpect(jsonPath("$.capacity").value(10000));
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

    @Test
    void getAllWarehouses_ShouldReturnWarehouseList() throws Exception {
        List<WarehouseResponse> warehouses = Arrays.asList(
                WarehouseResponse.builder()
                        .id(1L)
                        .name("Warehouse 1")
                        .location("Location 1")
                        .capacity(5000)
                        .currentOccupancy(1000)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),
                WarehouseResponse.builder()
                        .id(2L)
                        .name("Warehouse 2")
                        .location("Location 2")
                        .capacity(8000)
                        .currentOccupancy(2000)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        when(warehouseService.getAllWarehouses()).thenReturn(warehouses);

        mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Warehouse 1"))
                .andExpect(jsonPath("$[1].name").value("Warehouse 2"));
    }

    @Test
    void getWarehouseById_ShouldReturnWarehouse() throws Exception {
        WarehouseResponse response = WarehouseResponse.builder()
                .id(1L)
                .name("Main Warehouse")
                .location("New York")
                .capacity(10000)
                .currentOccupancy(2500)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(warehouseService.getWarehouseById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/warehouses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Main Warehouse"));
    }

    @Test
    void updateWarehouse_ShouldReturnUpdatedWarehouse() throws Exception {
        CreateWarehouseRequest request = new CreateWarehouseRequest();
        request.setName("Updated Warehouse");
        request.setLocation("Boston");
        request.setCapacity(15000);

        WarehouseResponse response = WarehouseResponse.builder()
                .id(1L)
                .name("Updated Warehouse")
                .location("Boston")
                .capacity(15000)
                .currentOccupancy(2500)
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now())
                .build();

        when(warehouseService.updateWarehouse(eq(1L), any(CreateWarehouseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/warehouses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Updated Warehouse"))
                .andExpect(jsonPath("$.location").value("Boston"));
    }

    @Test
    void deleteWarehouse_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/warehouses/1"))
                .andExpect(status().isNoContent());
    }
}

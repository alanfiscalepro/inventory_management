package com.warehouse.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.inventory.dto.request.CreateProductRequest;
import com.warehouse.inventory.dto.response.ProductResponse;
import com.warehouse.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    void createProduct_ShouldReturnCreatedProduct() throws Exception {
        CreateProductRequest request = new CreateProductRequest();
        request.setSku("PROD-001");
        request.setName("Laptop");
        request.setDescription("High performance laptop");
        request.setPrice(new BigDecimal("999.99"));
        request.setQuantity(100);
        request.setWarehouseId(1L);

        ProductResponse response = ProductResponse.builder()
                .id(1L)
                .sku("PROD-001")
                .name("Laptop")
                .description("High performance laptop")
                .price(new BigDecimal("999.99"))
                .quantity(100)
                .availableQuantity(100)
                .reservedQuantity(0)
                .warehouseId(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productService.createProduct(any(CreateProductRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("PROD-001"))
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.price").value(999.99))
                .andExpect(jsonPath("$.quantity").value(100));
    }

    @Test
    void createProduct_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        CreateProductRequest request = new CreateProductRequest();
        request.setSku(""); // Invalid empty SKU

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllProducts_ShouldReturnProductList() throws Exception {
        List<ProductResponse> products = Arrays.asList(
                ProductResponse.builder()
                        .id(1L)
                        .sku("PROD-001")
                        .name("Laptop")
                        .price(new BigDecimal("999.99"))
                        .quantity(100)
                        .availableQuantity(100)
                        .reservedQuantity(0)
                        .warehouseId(1L)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),
                ProductResponse.builder()
                        .id(2L)
                        .sku("PROD-002")
                        .name("Mouse")
                        .price(new BigDecimal("29.99"))
                        .quantity(500)
                        .availableQuantity(480)
                        .reservedQuantity(20)
                        .warehouseId(1L)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        when(productService.getAllProducts()).thenReturn(products);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].sku").value("PROD-001"))
                .andExpect(jsonPath("$[1].sku").value("PROD-002"));
    }

    @Test
    void getProductById_ShouldReturnProduct() throws Exception {
        ProductResponse response = ProductResponse.builder()
                .id(1L)
                .sku("PROD-001")
                .name("Laptop")
                .price(new BigDecimal("999.99"))
                .quantity(100)
                .availableQuantity(100)
                .reservedQuantity(0)
                .warehouseId(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(productService.getProductById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("PROD-001"));
    }

    @Test
    void getProductsByWarehouse_ShouldReturnProductList() throws Exception {
        List<ProductResponse> products = Arrays.asList(
                ProductResponse.builder()
                        .id(1L)
                        .sku("PROD-001")
                        .name("Laptop")
                        .warehouseId(1L)
                        .quantity(100)
                        .availableQuantity(100)
                        .reservedQuantity(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        when(productService.getProductsByWarehouse(1L)).thenReturn(products);

        mockMvc.perform(get("/api/products/warehouse/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].warehouseId").value(1));
    }

    @Test
    void updateProduct_ShouldReturnUpdatedProduct() throws Exception {
        CreateProductRequest request = new CreateProductRequest();
        request.setSku("PROD-001-UPD");
        request.setName("Updated Laptop");
        request.setPrice(new BigDecimal("1099.99"));
        request.setQuantity(150);
        request.setWarehouseId(1L);

        ProductResponse response = ProductResponse.builder()
                .id(1L)
                .sku("PROD-001-UPD")
                .name("Updated Laptop")
                .price(new BigDecimal("1099.99"))
                .quantity(150)
                .availableQuantity(150)
                .reservedQuantity(0)
                .warehouseId(1L)
                .createdAt(LocalDateTime.now().minusDays(10))
                .updatedAt(LocalDateTime.now())
                .build();

        when(productService.updateProduct(eq(1L), any(CreateProductRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Updated Laptop"));
    }

    @Test
    void deleteProduct_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/products/1"))
                .andExpect(status().isNoContent());
    }
}

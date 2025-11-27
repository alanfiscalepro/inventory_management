package com.warehouse.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.inventory.dto.request.CreateTransactionRequest;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.entity.enums.TransactionType;
import com.warehouse.inventory.service.TransactionService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @Test
    void createTransaction_ShouldReturnCreatedTransaction() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setProductId(1L);
        request.setType(TransactionType.IN);
        request.setQuantity(50);
        request.setReference("PO-12345");
        request.setNotes("Initial stock");

        TransactionResponse response = TransactionResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .type(TransactionType.IN)
                .quantity(50)
                .reference("PO-12345")
                .notes("Initial stock")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.createTransaction(any(CreateTransactionRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.type").value("IN"))
                .andExpect(jsonPath("$.quantity").value(50))
                .andExpect(jsonPath("$.reference").value("PO-12345"));
    }

    @Test
    void createTransaction_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setQuantity(-10); // Invalid negative quantity

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllTransactions_ShouldReturnTransactionList() throws Exception {
        List<TransactionResponse> transactions = Arrays.asList(
                TransactionResponse.builder()
                        .id(1L)
                        .productId(1L)
                        .productSku("PROD-001")
                        .productName("Laptop")
                        .type(TransactionType.IN)
                        .quantity(50)
                        .reference("PO-12345")
                        .createdAt(LocalDateTime.now())
                        .build(),
                TransactionResponse.builder()
                        .id(2L)
                        .productId(1L)
                        .productSku("PROD-001")
                        .productName("Laptop")
                        .type(TransactionType.OUT)
                        .quantity(10)
                        .reference("SO-67890")
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        when(transactionService.getAllTransactions()).thenReturn(transactions);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].type").value("IN"))
                .andExpect(jsonPath("$[1].type").value("OUT"));
    }

    @Test
    void getTransactionById_ShouldReturnTransaction() throws Exception {
        TransactionResponse response = TransactionResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .type(TransactionType.IN)
                .quantity(50)
                .reference("PO-12345")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.getTransactionById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.type").value("IN"));
    }

    @Test
    void getTransactionsByProduct_ShouldReturnTransactionList() throws Exception {
        List<TransactionResponse> transactions = Arrays.asList(
                TransactionResponse.builder()
                        .id(1L)
                        .productId(1L)
                        .productSku("PROD-001")
                        .productName("Laptop")
                        .type(TransactionType.IN)
                        .quantity(50)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        when(transactionService.getTransactionsByProduct(1L)).thenReturn(transactions);

        mockMvc.perform(get("/api/transactions/product/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].productId").value(1));
    }
}

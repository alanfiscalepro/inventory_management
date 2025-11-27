package com.warehouse.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.warehouse.inventory.dto.request.CreateReservationRequest;
import com.warehouse.inventory.dto.response.ReservationResponse;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import com.warehouse.inventory.service.ReservationService;
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

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReservationService reservationService;

    @Test
    void createReservation_ShouldReturnCreatedReservation() throws Exception {
        CreateReservationRequest request = new CreateReservationRequest();
        request.setProductId(1L);
        request.setQuantity(10);
        request.setCustomerName("John Doe");
        request.setNotes("Holiday sale reservation");

        ReservationResponse response = ReservationResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .quantity(10)
                .status(ReservationStatus.PENDING)
                .customerName("John Doe")
                .notes("Holiday sale reservation")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationService.createReservation(any(CreateReservationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.quantity").value(10))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.customerName").value("John Doe"));
    }

    @Test
    void createReservation_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        CreateReservationRequest request = new CreateReservationRequest();
        request.setQuantity(0); // Invalid zero quantity

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllReservations_ShouldReturnReservationList() throws Exception {
        List<ReservationResponse> reservations = Arrays.asList(
                ReservationResponse.builder()
                        .id(1L)
                        .productId(1L)
                        .productSku("PROD-001")
                        .productName("Laptop")
                        .quantity(10)
                        .status(ReservationStatus.PENDING)
                        .customerName("John Doe")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build(),
                ReservationResponse.builder()
                        .id(2L)
                        .productId(2L)
                        .productSku("PROD-002")
                        .productName("Mouse")
                        .quantity(20)
                        .status(ReservationStatus.CONFIRMED)
                        .customerName("Jane Smith")
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        when(reservationService.getAllReservations()).thenReturn(reservations);

        mockMvc.perform(get("/api/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[1].status").value("CONFIRMED"));
    }

    @Test
    void getReservationById_ShouldReturnReservation() throws Exception {
        ReservationResponse response = ReservationResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .quantity(10)
                .status(ReservationStatus.PENDING)
                .customerName("John Doe")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationService.getReservationById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/reservations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getReservationsByProduct_ShouldReturnReservationList() throws Exception {
        List<ReservationResponse> reservations = Arrays.asList(
                ReservationResponse.builder()
                        .id(1L)
                        .productId(1L)
                        .productSku("PROD-001")
                        .productName("Laptop")
                        .quantity(10)
                        .status(ReservationStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
        );

        when(reservationService.getReservationsByProduct(1L)).thenReturn(reservations);

        mockMvc.perform(get("/api/reservations/product/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].productId").value(1));
    }

    @Test
    void confirmReservation_ShouldReturnConfirmedReservation() throws Exception {
        ReservationResponse response = ReservationResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .quantity(10)
                .status(ReservationStatus.CONFIRMED)
                .customerName("John Doe")
                .createdAt(LocalDateTime.now().minusHours(2))
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationService.confirmReservation(1L)).thenReturn(response);

        mockMvc.perform(post("/api/reservations/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void cancelReservation_ShouldReturnCancelledReservation() throws Exception {
        ReservationResponse response = ReservationResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .quantity(10)
                .status(ReservationStatus.CANCELLED)
                .customerName("John Doe")
                .createdAt(LocalDateTime.now().minusHours(2))
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationService.cancelReservation(1L)).thenReturn(response);

        mockMvc.perform(post("/api/reservations/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void fulfillReservation_ShouldReturnFulfilledReservation() throws Exception {
        ReservationResponse response = ReservationResponse.builder()
                .id(1L)
                .productId(1L)
                .productSku("PROD-001")
                .productName("Laptop")
                .quantity(10)
                .status(ReservationStatus.FULFILLED)
                .customerName("John Doe")
                .createdAt(LocalDateTime.now().minusHours(2))
                .updatedAt(LocalDateTime.now())
                .build();

        when(reservationService.fulfillReservation(1L)).thenReturn(response);

        mockMvc.perform(post("/api/reservations/1/fulfill"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("FULFILLED"));
    }
}

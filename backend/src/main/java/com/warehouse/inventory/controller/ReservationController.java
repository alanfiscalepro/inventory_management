package com.warehouse.inventory.controller;

import com.warehouse.inventory.dto.request.CreateReservationRequest;
import com.warehouse.inventory.dto.response.ReservationResponse;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request) {
        ReservationResponse response = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<ReservationResponse> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        ReservationResponse reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByProduct(@PathVariable Long productId) {
        List<ReservationResponse> reservations = reservationService.getReservationsByProduct(productId);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Long id) {
        ReservationResponse response = reservationService.cancelReservation(id, null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<TransactionResponse> fulfillReservation(@PathVariable Long id) {
        TransactionResponse response = reservationService.fulfillReservation(id, null);
        return ResponseEntity.ok(response);
    }
}

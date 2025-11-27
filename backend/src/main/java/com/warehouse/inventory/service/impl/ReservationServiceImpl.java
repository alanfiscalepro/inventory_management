package com.warehouse.inventory.service.impl;

import com.warehouse.inventory.dto.request.CreateReservationRequest;
import com.warehouse.inventory.dto.response.ReservationResponse;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Reservation;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import com.warehouse.inventory.exception.InsufficientStockException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.ProductRepository;
import com.warehouse.inventory.repository.ReservationRepository;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.ReservationService;
import com.warehouse.inventory.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final TransactionService transactionService;

    @Override
    public ReservationResponse createReservation(CreateReservationRequest request) {
        log.info("Creating reservation for product ID: {} with quantity: {}", request.productId(), request.quantity());

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.productId()));

        // Check if sufficient stock is available
        int availableQuantity = product.getAvailableQuantity();
        if (availableQuantity < request.quantity()) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for reservation. Product '%s' (SKU: %s) has only %d units available, but %d requested",
                            product.getName(), product.getSku(), availableQuantity, request.quantity()));
        }

        // Validate expiration date
        if (request.expiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Expiration date must be in the future");
        }

        // Create reservation
        Reservation reservation = Reservation.builder()
                .quantity(request.quantity())
                .status(ReservationStatus.ACTIVE)
                .expiresAt(request.expiresAt())
                .reservedBy(request.reservedBy())
                .reference(request.reference())
                .notes(request.notes())
                .product(product)
                .build();

        // Increase reserved quantity
        product.setReservedQuantity(product.getReservedQuantity() + request.quantity());
        productRepository.save(product);

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Successfully created reservation with ID: {} - Reserved {} units",
                savedReservation.getId(), request.quantity());

        return ReservationResponse.fromEntity(savedReservation);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        log.debug("Fetching reservation with ID: {}", id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        return ReservationResponse.fromEntity(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        log.debug("Fetching all reservations");

        return reservationRepository.findAll().stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByProduct(Long productId) {
        log.debug("Fetching reservations for product: {}", productId);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return reservationRepository.findByProductId(productId).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByProductAndStatus(Long productId, ReservationStatus status) {
        log.debug("Fetching reservations for product {} with status: {}", productId, status);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return reservationRepository.findByProductIdAndStatus(productId, status).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByStatus(ReservationStatus status) {
        log.debug("Fetching reservations with status: {}", status);

        return reservationRepository.findByStatus(status).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getActiveReservations() {
        log.debug("Fetching active reservations");

        LocalDateTime now = LocalDateTime.now();
        return reservationRepository.findByStatus(ReservationStatus.ACTIVE).stream()
                .filter(r -> r.getExpiresAt().isAfter(now))
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getActiveReservationsByProduct(Long productId) {
        log.debug("Fetching active reservations for product: {}", productId);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return reservationRepository.findActiveReservationsByProduct(productId, LocalDateTime.now()).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getActiveReservationsByWarehouse(Long warehouseId) {
        log.debug("Fetching active reservations for warehouse: {}", warehouseId);

        // Verify warehouse exists
        warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        return reservationRepository.findActiveReservationsByWarehouse(warehouseId).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getExpiredReservations() {
        log.debug("Fetching expired reservations");

        return reservationRepository.findExpiredReservations(LocalDateTime.now()).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponse fulfillReservation(Long id, String notes) {
        log.info("Fulfilling reservation with ID: {}", id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        // Validate reservation can be fulfilled
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Cannot fulfill reservation with status: " + reservation.getStatus());
        }

        if (reservation.isExpired()) {
            throw new IllegalStateException("Cannot fulfill expired reservation");
        }

        Product product = reservation.getProduct();

        // Check if sufficient quantity is available
        if (product.getQuantity() < reservation.getQuantity()) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock to fulfill reservation. Product has %d units, reservation requires %d",
                            product.getQuantity(), reservation.getQuantity()));
        }

        // Create outbound transaction
        String transactionNotes = notes != null ? notes : "Fulfilling reservation #" + id;
        String reference = "RES-" + id;
        TransactionResponse transaction = transactionService.createOutboundTransaction(
                product.getId(),
                reservation.getQuantity(),
                transactionNotes,
                reference
        );

        // Update reservation status
        reservation.setStatus(ReservationStatus.FULFILLED);

        // Reduce reserved quantity
        product.setReservedQuantity(product.getReservedQuantity() - reservation.getQuantity());
        productRepository.save(product);

        reservationRepository.save(reservation);

        log.info("Successfully fulfilled reservation {} - Created transaction {}", id, transaction.getId());
        return transaction;
    }

    @Override
    public ReservationResponse cancelReservation(Long id, String notes) {
        log.info("Cancelling reservation with ID: {}", id);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        // Validate reservation can be cancelled
        if (reservation.getStatus() == ReservationStatus.FULFILLED) {
            throw new IllegalStateException("Cannot cancel a fulfilled reservation");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("Reservation is already cancelled");
        }

        Product product = reservation.getProduct();

        // Update reservation status
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (notes != null) {
            String existingNotes = reservation.getNotes();
            reservation.setNotes(existingNotes != null ? existingNotes + " | Cancellation: " + notes : "Cancellation: " + notes);
        }

        // Reduce reserved quantity only if it was still ACTIVE
        if (reservation.getStatus() != ReservationStatus.EXPIRED) {
            product.setReservedQuantity(product.getReservedQuantity() - reservation.getQuantity());
            productRepository.save(product);
        }

        Reservation updatedReservation = reservationRepository.save(reservation);
        log.info("Successfully cancelled reservation with ID: {}", id);

        return ReservationResponse.fromEntity(updatedReservation);
    }

    @Override
    public int expireReservations() {
        log.info("Expiring overdue reservations");

        List<Reservation> expiredReservations = reservationRepository.findExpiredReservations(LocalDateTime.now());
        int count = 0;

        for (Reservation reservation : expiredReservations) {
            try {
                reservation.setStatus(ReservationStatus.EXPIRED);

                // Release reserved quantity
                Product product = reservation.getProduct();
                product.setReservedQuantity(product.getReservedQuantity() - reservation.getQuantity());
                productRepository.save(product);

                reservationRepository.save(reservation);
                count++;

                log.debug("Expired reservation ID: {} for product {}", reservation.getId(), product.getSku());
            } catch (Exception e) {
                log.error("Error expiring reservation {}: {}", reservation.getId(), e.getMessage());
            }
        }

        log.info("Successfully expired {} reservations", count);
        return count;
    }

    @Override
    public ReservationResponse extendReservation(Long id, LocalDateTime newExpiresAt) {
        log.info("Extending reservation {} to new expiration: {}", id, newExpiresAt);

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + id));

        // Validate reservation can be extended
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new IllegalStateException("Can only extend ACTIVE reservations. Current status: " + reservation.getStatus());
        }

        // Validate new expiration date
        if (newExpiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("New expiration date must be in the future");
        }

        if (newExpiresAt.isBefore(reservation.getExpiresAt())) {
            throw new IllegalArgumentException("New expiration date must be after current expiration date");
        }

        reservation.setExpiresAt(newExpiresAt);
        Reservation updatedReservation = reservationRepository.save(reservation);

        log.info("Successfully extended reservation with ID: {}", id);
        return ReservationResponse.fromEntity(updatedReservation);
    }
}

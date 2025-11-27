package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateReservationRequest;
import com.warehouse.inventory.dto.response.ReservationResponse;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.entity.enums.ReservationStatus;

import java.util.List;

public interface ReservationService {

    /**
     * Create a new reservation
     * @param request reservation creation request
     * @return created reservation
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws com.warehouse.inventory.exception.InsufficientStockException if insufficient stock available
     */
    ReservationResponse createReservation(CreateReservationRequest request);

    /**
     * Get reservation by ID
     * @param id reservation ID
     * @return reservation details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if reservation not found
     */
    ReservationResponse getReservationById(Long id);

    /**
     * Get all reservations
     * @return list of all reservations
     */
    List<ReservationResponse> getAllReservations();

    /**
     * Get reservations by product
     * @param productId product ID
     * @return list of reservations for the product
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<ReservationResponse> getReservationsByProduct(Long productId);

    /**
     * Get reservations by product and status
     * @param productId product ID
     * @param status reservation status
     * @return list of reservations matching criteria
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<ReservationResponse> getReservationsByProductAndStatus(Long productId, ReservationStatus status);

    /**
     * Get reservations by status
     * @param status reservation status
     * @return list of reservations with the specified status
     */
    List<ReservationResponse> getReservationsByStatus(ReservationStatus status);

    /**
     * Get active reservations (not expired and status is ACTIVE)
     * @return list of active reservations
     */
    List<ReservationResponse> getActiveReservations();

    /**
     * Get active reservations by product
     * @param productId product ID
     * @return list of active reservations for the product
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<ReservationResponse> getActiveReservationsByProduct(Long productId);

    /**
     * Get active reservations by warehouse
     * @param warehouseId warehouse ID
     * @return list of active reservations for products in the warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    List<ReservationResponse> getActiveReservationsByWarehouse(Long warehouseId);

    /**
     * Get expired reservations
     * @return list of expired but not yet processed reservations
     */
    List<ReservationResponse> getExpiredReservations();

    /**
     * Fulfill a reservation (creates outbound transaction and updates product quantity)
     * @param id reservation ID
     * @param notes optional notes for the transaction
     * @return created transaction
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if reservation not found
     * @throws IllegalStateException if reservation is not active or is expired
     * @throws com.warehouse.inventory.exception.InsufficientStockException if insufficient stock available
     */
    TransactionResponse fulfillReservation(Long id, String notes);

    /**
     * Cancel a reservation (reduces reserved quantity)
     * @param id reservation ID
     * @param notes optional cancellation notes
     * @return updated reservation
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if reservation not found
     * @throws IllegalStateException if reservation cannot be cancelled
     */
    ReservationResponse cancelReservation(Long id, String notes);

    /**
     * Expire reservations that have passed their expiration date
     * @return number of reservations expired
     */
    int expireReservations();

    /**
     * Extend reservation expiration date
     * @param id reservation ID
     * @param newExpiresAt new expiration date/time
     * @return updated reservation
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if reservation not found
     * @throws IllegalStateException if reservation is not active
     */
    ReservationResponse extendReservation(Long id, java.time.LocalDateTime newExpiresAt);
}

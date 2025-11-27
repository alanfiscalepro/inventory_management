package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateTransactionRequest;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.entity.enums.TransactionType;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {

    /**
     * Create a new transaction and update product quantity
     * @param request transaction creation request
     * @return created transaction
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws com.warehouse.inventory.exception.InsufficientStockException if insufficient stock for outbound transaction
     */
    TransactionResponse createTransaction(CreateTransactionRequest request);

    /**
     * Get transaction by ID
     * @param id transaction ID
     * @return transaction details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if transaction not found
     */
    TransactionResponse getTransactionById(Long id);

    /**
     * Get all transactions
     * @return list of all transactions
     */
    List<TransactionResponse> getAllTransactions();

    /**
     * Get transactions by product
     * @param productId product ID
     * @return list of transactions for the product
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<TransactionResponse> getTransactionsByProduct(Long productId);

    /**
     * Get transactions by product ordered by creation date
     * @param productId product ID
     * @return list of transactions for the product ordered by date (newest first)
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<TransactionResponse> getTransactionsByProductOrderedByDate(Long productId);

    /**
     * Get transactions by type
     * @param type transaction type
     * @return list of transactions of the specified type
     */
    List<TransactionResponse> getTransactionsByType(TransactionType type);

    /**
     * Get transactions by product and date range
     * @param productId product ID
     * @param startDate start date
     * @param endDate end date
     * @return list of transactions within the date range
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    List<TransactionResponse> getTransactionsByProductAndDateRange(Long productId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get transactions by warehouse
     * @param warehouseId warehouse ID
     * @return list of transactions for products in the warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    List<TransactionResponse> getTransactionsByWarehouse(Long warehouseId);

    /**
     * Create inbound transaction (stock received)
     * @param productId product ID
     * @param quantity quantity to add
     * @param notes optional notes
     * @param reference optional reference
     * @return created transaction
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    TransactionResponse createInboundTransaction(Long productId, int quantity, String notes, String reference);

    /**
     * Create outbound transaction (stock shipped/sold)
     * @param productId product ID
     * @param quantity quantity to remove
     * @param notes optional notes
     * @param reference optional reference
     * @return created transaction
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws com.warehouse.inventory.exception.InsufficientStockException if insufficient stock
     */
    TransactionResponse createOutboundTransaction(Long productId, int quantity, String notes, String reference);

    /**
     * Create adjustment transaction (manual stock adjustment)
     * @param productId product ID
     * @param quantityChange quantity change (positive or negative)
     * @param notes optional notes
     * @param reference optional reference
     * @return created transaction
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws com.warehouse.inventory.exception.InsufficientStockException if adjustment would result in negative stock
     */
    TransactionResponse createAdjustmentTransaction(Long productId, int quantityChange, String notes, String reference);
}

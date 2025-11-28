package com.warehouse.inventory.service.impl;

import com.warehouse.inventory.dto.request.CreateTransactionRequest;
import com.warehouse.inventory.dto.response.TransactionResponse;
import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Transaction;
import com.warehouse.inventory.entity.enums.TransactionType;
import com.warehouse.inventory.exception.InsufficientStockException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.ProductRepository;
import com.warehouse.inventory.repository.TransactionRepository;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public TransactionResponse createTransaction(CreateTransactionRequest request) {
        log.info("Creating transaction of type {} for product ID: {} with quantity: {}",
                request.type(), request.productId(), request.quantity());

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.productId()));

        int quantityBefore = product.getQuantity();
        int quantityAfter;

        // Calculate new quantity based on transaction type
        switch (request.type()) {
            case INBOUND:
            case RETURN:
                quantityAfter = quantityBefore + request.quantity();
                break;
            case OUTBOUND:
            case DAMAGED:
                if (product.getAvailableQuantity() < request.quantity()) {
                    throw new InsufficientStockException(
                            String.format("Insufficient stock for product '%s' (SKU: %s). Available: %d, Required: %d",
                                    product.getName(), product.getSku(), product.getAvailableQuantity(), request.quantity()));
                }
                quantityAfter = quantityBefore - request.quantity();
                break;
            case ADJUSTMENT:
                // For adjustments, quantity can be positive or negative
                int quantityChange = request.quantity();
                quantityAfter = quantityBefore + quantityChange;
                if (quantityAfter < product.getReservedQuantity()) {
                    throw new InsufficientStockException(
                            String.format("Cannot adjust quantity below reserved amount. Reserved: %d, New quantity would be: %d",
                                    product.getReservedQuantity(), quantityAfter));
                }
                break;
            case TRANSFER:
                if (product.getAvailableQuantity() < request.quantity()) {
                    throw new InsufficientStockException(
                            String.format("Insufficient stock for transfer. Available: %d, Required: %d",
                                    product.getAvailableQuantity(), request.quantity()));
                }
                quantityAfter = quantityBefore - request.quantity();
                break;
            default:
                throw new IllegalArgumentException("Unsupported transaction type: " + request.type());
        }

        // Ensure quantity doesn't go negative
        if (quantityAfter < 0) {
            throw new InsufficientStockException("Transaction would result in negative quantity");
        }

        // Create transaction
        Transaction transaction = Transaction.builder()
                .type(request.type())
                .quantity(request.quantity())
                .quantityBefore(quantityBefore)
                .quantityAfter(quantityAfter)
                .notes(request.notes())
                .reference(request.reference())
                .product(product)
                .build();

        // Update product quantity
        product.setQuantity(quantityAfter);
        productRepository.save(product);

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Successfully created transaction with ID: {} - Quantity changed from {} to {}",
                savedTransaction.getId(), quantityBefore, quantityAfter);

        return TransactionResponse.fromEntity(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id) {
        log.debug("Fetching transaction with ID: {}", id);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        return TransactionResponse.fromEntity(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        log.debug("Fetching all transactions");

        return transactionRepository.findAll().stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByProduct(Long productId) {
        log.debug("Fetching transactions for product: {}", productId);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return transactionRepository.findByProductId(productId).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByProductOrderedByDate(Long productId) {
        log.debug("Fetching transactions for product {} ordered by date", productId);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByType(TransactionType type) {
        log.debug("Fetching transactions of type: {}", type);

        return transactionRepository.findByType(type).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByProductAndDateRange(
            Long productId, LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Fetching transactions for product {} between {} and {}", productId, startDate, endDate);

        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return transactionRepository.findByProductIdAndDateRange(productId, startDate, endDate).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByWarehouse(Long warehouseId) {
        log.debug("Fetching transactions for warehouse: {}", warehouseId);

        // Verify warehouse exists
        warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        return transactionRepository.findByWarehouseId(warehouseId).stream()
                .map(TransactionResponse::fromEntity)
                .toList();
    }

    @Override
    public TransactionResponse createInboundTransaction(Long productId, int quantity, String notes, String reference) {
        log.info("Creating inbound transaction for product {} with quantity: {}", productId, quantity);

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.INBOUND,
                quantity,
                notes,
                reference,
                productId
        );

        return createTransaction(request);
    }

    @Override
    public TransactionResponse createOutboundTransaction(Long productId, int quantity, String notes, String reference) {
        log.info("Creating outbound transaction for product {} with quantity: {}", productId, quantity);

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.OUTBOUND,
                quantity,
                notes,
                reference,
                productId
        );

        return createTransaction(request);
    }

    @Override
    public TransactionResponse createAdjustmentTransaction(Long productId, int quantityChange, String notes, String reference) {
        log.info("Creating adjustment transaction for product {} with quantity change: {}", productId, quantityChange);

        CreateTransactionRequest request = new CreateTransactionRequest(
                TransactionType.ADJUSTMENT,
                quantityChange,
                notes,
                reference,
                productId
        );

        return createTransaction(request);
    }
}

package com.warehouse.inventory.service.impl;

import com.warehouse.inventory.dto.request.CreateProductRequest;
import com.warehouse.inventory.dto.response.ProductResponse;
import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Reservation;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import com.warehouse.inventory.exception.DuplicateResourceException;
import com.warehouse.inventory.exception.InsufficientStockException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.ProductRepository;
import com.warehouse.inventory.repository.ReservationRepository;
import com.warehouse.inventory.repository.TransactionRepository;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.ProductService;
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
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final ReservationRepository reservationRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating new product with SKU: {}", request.sku());

        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU '" + request.sku() + "' already exists");
        }

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.warehouseId()));

        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .quantity(request.quantity() != null ? request.quantity() : 0)
                .reservedQuantity(0)
                .price(request.price())
                .unit(request.unit() != null ? request.unit() : "pcs")
                .minStockLevel(request.minStockLevel() != null ? request.minStockLevel() : 0)
                .active(true)
                .warehouse(warehouse)
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Successfully created product with ID: {}", savedProduct.getId());

        return ProductResponse.fromEntity(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return ProductResponse.fromEntity(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        log.debug("Fetching product with SKU: {}", sku);

        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));

        return ProductResponse.fromEntity(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        log.debug("Fetching all products");

        return productRepository.findAll().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        log.debug("Fetching active products");

        return productRepository.findByActiveTrue().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByWarehouse(Long warehouseId) {
        log.debug("Fetching products for warehouse: {}", warehouseId);

        // Verify warehouse exists
        warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        return productRepository.findByWarehouseId(warehouseId).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProductsByWarehouse(Long warehouseId) {
        log.debug("Fetching active products for warehouse: {}", warehouseId);

        // Verify warehouse exists
        warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        return productRepository.findActiveProductsByWarehouse(warehouseId).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        log.debug("Fetching low stock products");

        return productRepository.findLowStockProducts().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse updateProduct(Long id, CreateProductRequest request) {
        log.info("Updating product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Check if new SKU conflicts with another product
        if (!product.getSku().equals(request.sku()) &&
            productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU '" + request.sku() + "' already exists");
        }

        // Verify warehouse exists if it's being changed
        if (!product.getWarehouse().getId().equals(request.warehouseId())) {
            Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.warehouseId()));
            product.setWarehouse(warehouse);
        }

        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setUnit(request.unit() != null ? request.unit() : "pcs");
        product.setMinStockLevel(request.minStockLevel() != null ? request.minStockLevel() : 0);

        // Note: quantity is not updated here - use transactions to update inventory

        Product updatedProduct = productRepository.save(product);
        log.info("Successfully updated product with ID: {}", id);

        return ProductResponse.fromEntity(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Check for active reservations
        List<Reservation> activeReservations = reservationRepository
                .findActiveReservationsByProduct(id, LocalDateTime.now());
        if (!activeReservations.isEmpty()) {
            throw new IllegalStateException("Cannot delete product with active reservations. " +
                    "Product has " + activeReservations.size() + " active reservations.");
        }

        // Check for recent transactions (within last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentTransactionCount = transactionRepository
                .findByProductIdAndDateRange(id, thirtyDaysAgo, LocalDateTime.now())
                .size();
        if (recentTransactionCount > 0) {
            throw new IllegalStateException("Cannot delete product with recent transactions. " +
                    "Product has " + recentTransactionCount + " transactions in the last 30 days. " +
                    "Consider deactivating instead.");
        }

        productRepository.delete(product);
        log.info("Successfully deleted product with ID: {}", id);
    }

    @Override
    public ProductResponse setProductActive(Long id, boolean active) {
        log.info("Setting product {} active status to: {}", id, active);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        product.setActive(active);
        Product updatedProduct = productRepository.save(product);

        log.info("Successfully updated active status for product: {}", id);
        return ProductResponse.fromEntity(updatedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasSufficientStock(Long productId, int requiredQuantity) {
        log.debug("Checking stock availability for product {} with required quantity: {}", productId, requiredQuantity);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        return product.getAvailableQuantity() >= requiredQuantity;
    }

    @Override
    @Transactional(readOnly = true)
    public void validateStockAvailability(Long productId, int requiredQuantity) {
        log.debug("Validating stock availability for product {} with required quantity: {}", productId, requiredQuantity);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        int availableQuantity = product.getAvailableQuantity();
        if (availableQuantity < requiredQuantity) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for product '%s' (SKU: %s). Available: %d, Required: %d",
                            product.getName(), product.getSku(), availableQuantity, requiredQuantity));
        }
    }
}

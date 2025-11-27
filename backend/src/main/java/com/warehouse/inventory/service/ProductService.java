package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateProductRequest;
import com.warehouse.inventory.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    /**
     * Create a new product
     * @param request product creation request
     * @return created product
     * @throws com.warehouse.inventory.exception.DuplicateResourceException if SKU already exists
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    ProductResponse createProduct(CreateProductRequest request);

    /**
     * Get product by ID
     * @param id product ID
     * @return product details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    ProductResponse getProductById(Long id);

    /**
     * Get product by SKU
     * @param sku product SKU
     * @return product details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    ProductResponse getProductBySku(String sku);

    /**
     * Get all products
     * @return list of all products
     */
    List<ProductResponse> getAllProducts();

    /**
     * Get all active products
     * @return list of active products
     */
    List<ProductResponse> getActiveProducts();

    /**
     * Get products by warehouse
     * @param warehouseId warehouse ID
     * @return list of products in warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    List<ProductResponse> getProductsByWarehouse(Long warehouseId);

    /**
     * Get active products by warehouse
     * @param warehouseId warehouse ID
     * @return list of active products in warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    List<ProductResponse> getActiveProductsByWarehouse(Long warehouseId);

    /**
     * Get low stock products
     * @return list of products with low stock
     */
    List<ProductResponse> getLowStockProducts();

    /**
     * Update product
     * @param id product ID
     * @param request update request
     * @return updated product
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product or warehouse not found
     * @throws com.warehouse.inventory.exception.DuplicateResourceException if new SKU already exists
     */
    ProductResponse updateProduct(Long id, CreateProductRequest request);

    /**
     * Delete product
     * @param id product ID
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws IllegalStateException if product has active reservations or recent transactions
     */
    void deleteProduct(Long id);

    /**
     * Activate/deactivate product
     * @param id product ID
     * @param active activation status
     * @return updated product
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    ProductResponse setProductActive(Long id, boolean active);

    /**
     * Check if product has sufficient available quantity
     * @param productId product ID
     * @param requiredQuantity quantity to check
     * @return true if sufficient stock available
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     */
    boolean hasSufficientStock(Long productId, int requiredQuantity);

    /**
     * Validate stock availability
     * @param productId product ID
     * @param requiredQuantity quantity to validate
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if product not found
     * @throws com.warehouse.inventory.exception.InsufficientStockException if insufficient stock
     */
    void validateStockAvailability(Long productId, int requiredQuantity);
}

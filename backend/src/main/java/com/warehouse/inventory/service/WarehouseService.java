package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateWarehouseRequest;
import com.warehouse.inventory.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {

    /**
     * Create a new warehouse
     * @param request warehouse creation request
     * @return created warehouse
     * @throws com.warehouse.inventory.exception.DuplicateResourceException if warehouse name already exists
     */
    WarehouseResponse createWarehouse(CreateWarehouseRequest request);

    /**
     * Get warehouse by ID
     * @param id warehouse ID
     * @return warehouse details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    WarehouseResponse getWarehouseById(Long id);

    /**
     * Get warehouse by name
     * @param name warehouse name
     * @return warehouse details
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    WarehouseResponse getWarehouseByName(String name);

    /**
     * Get all warehouses
     * @return list of all warehouses
     */
    List<WarehouseResponse> getAllWarehouses();

    /**
     * Get all active warehouses
     * @return list of active warehouses
     */
    List<WarehouseResponse> getActiveWarehouses();

    /**
     * Update warehouse
     * @param id warehouse ID
     * @param request update request
     * @return updated warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     * @throws com.warehouse.inventory.exception.DuplicateResourceException if new name already exists
     */
    WarehouseResponse updateWarehouse(Long id, CreateWarehouseRequest request);

    /**
     * Delete warehouse
     * @param id warehouse ID
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     * @throws IllegalStateException if warehouse has products
     */
    void deleteWarehouse(Long id);

    /**
     * Activate/deactivate warehouse
     * @param id warehouse ID
     * @param active activation status
     * @return updated warehouse
     * @throws com.warehouse.inventory.exception.ResourceNotFoundException if warehouse not found
     */
    WarehouseResponse setWarehouseActive(Long id, boolean active);
}

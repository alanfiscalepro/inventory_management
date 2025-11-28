package com.warehouse.inventory.service.impl;

import com.warehouse.inventory.dto.request.CreateWarehouseRequest;
import com.warehouse.inventory.dto.response.WarehouseResponse;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.exception.DuplicateResourceException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request) {
        log.info("Creating new warehouse with name: {}", request.name());

        if (warehouseRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Warehouse with name '" + request.name() + "' already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .name(request.name())
                .location(request.location())
                .description(request.description())
                .active(true)
                .build();

        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        log.info("Successfully created warehouse with ID: {}", savedWarehouse.getId());

        return WarehouseResponse.fromEntityWithoutProducts(savedWarehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseById(Long id) {
        log.debug("Fetching warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        return WarehouseResponse.fromEntity(warehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouseByName(String name) {
        log.debug("Fetching warehouse with name: {}", name);

        Warehouse warehouse = warehouseRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with name: " + name));

        return WarehouseResponse.fromEntity(warehouse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getAllWarehouses() {
        log.debug("Fetching all warehouses");

        return warehouseRepository.findAll().stream()
                .map(WarehouseResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseResponse> getActiveWarehouses() {
        log.debug("Fetching active warehouses");

        return warehouseRepository.findByActiveTrue().stream()
                .map(WarehouseResponse::fromEntity)
                .toList();
    }

    @Override
    public WarehouseResponse updateWarehouse(Long id, CreateWarehouseRequest request) {
        log.info("Updating warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        // Check if new name conflicts with another warehouse
        if (!warehouse.getName().equals(request.name()) &&
            warehouseRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Warehouse with name '" + request.name() + "' already exists");
        }

        warehouse.setName(request.name());
        warehouse.setLocation(request.location());
        warehouse.setDescription(request.description());

        Warehouse updatedWarehouse = warehouseRepository.save(warehouse);
        log.info("Successfully updated warehouse with ID: {}", id);

        return WarehouseResponse.fromEntity(updatedWarehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {
        log.info("Deleting warehouse with ID: {}", id);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        if (warehouse.getProducts() != null && !warehouse.getProducts().isEmpty()) {
            throw new IllegalStateException("Cannot delete warehouse with existing products. " +
                    "Warehouse has " + warehouse.getProducts().size() + " products.");
        }

        warehouseRepository.delete(warehouse);
        log.info("Successfully deleted warehouse with ID: {}", id);
    }

    @Override
    public WarehouseResponse setWarehouseActive(Long id, boolean active) {
        log.info("Setting warehouse {} active status to: {}", id, active);

        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        warehouse.setActive(active);
        Warehouse updatedWarehouse = warehouseRepository.save(warehouse);

        log.info("Successfully updated active status for warehouse: {}", id);
        return WarehouseResponse.fromEntity(updatedWarehouse);
    }
}

package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateWarehouseRequest;
import com.warehouse.inventory.dto.response.WarehouseResponse;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.exception.DuplicateResourceException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.impl.WarehouseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private WarehouseServiceImpl warehouseService;

    private CreateWarehouseRequest createRequest;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        createRequest = new CreateWarehouseRequest();
        createRequest.setName("Test Warehouse");
        createRequest.setLocation("Test Location");
        createRequest.setDescription("Test Description");
        createRequest.setCapacity(10000);

        warehouse = Warehouse.builder()
                .id(1L)
                .name("Test Warehouse")
                .location("Test Location")
                .description("Test Description")
                .active(true)
                .products(new ArrayList<>())
                .build();
    }

    @Test
    void createWarehouse_ShouldReturnWarehouseResponse() {
        when(warehouseRepository.existsByName(anyString())).thenReturn(false);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

        WarehouseResponse response = warehouseService.createWarehouse(createRequest);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Warehouse");
        assertThat(response.getLocation()).isEqualTo("Test Location");
        verify(warehouseRepository, times(1)).save(any(Warehouse.class));
    }

    @Test
    void createWarehouse_WithDuplicateName_ShouldThrowException() {
        when(warehouseRepository.existsByName(anyString())).thenReturn(true);

        assertThatThrownBy(() -> warehouseService.createWarehouse(createRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(warehouseRepository, never()).save(any(Warehouse.class));
    }

    @Test
    void getWarehouseById_ShouldReturnWarehouse() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));

        WarehouseResponse response = warehouseService.getWarehouseById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Test Warehouse");
        verify(warehouseRepository, times(1)).findById(1L);
    }

    @Test
    void getWarehouseById_WithInvalidId_ShouldThrowException() {
        when(warehouseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> warehouseService.getWarehouseById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllWarehouses_ShouldReturnWarehouseList() {
        Warehouse warehouse2 = Warehouse.builder()
                .id(2L)
                .name("Warehouse 2")
                .location("Location 2")
                .active(true)
                .products(new ArrayList<>())
                .build();

        when(warehouseRepository.findAll()).thenReturn(Arrays.asList(warehouse, warehouse2));

        List<WarehouseResponse> responses = warehouseService.getAllWarehouses();

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getName()).isEqualTo("Test Warehouse");
        assertThat(responses.get(1).getName()).isEqualTo("Warehouse 2");
        verify(warehouseRepository, times(1)).findAll();
    }

    @Test
    void updateWarehouse_ShouldReturnUpdatedWarehouse() {
        CreateWarehouseRequest updateRequest = new CreateWarehouseRequest();
        updateRequest.setName("Updated Warehouse");
        updateRequest.setLocation("Updated Location");
        updateRequest.setDescription("Updated Description");
        updateRequest.setCapacity(15000);

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(warehouseRepository.existsByName("Updated Warehouse")).thenReturn(false);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

        WarehouseResponse response = warehouseService.updateWarehouse(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(warehouseRepository, times(1)).save(any(Warehouse.class));
    }

    @Test
    void updateWarehouse_WithDuplicateName_ShouldThrowException() {
        CreateWarehouseRequest updateRequest = new CreateWarehouseRequest();
        updateRequest.setName("Duplicate Name");
        updateRequest.setLocation("Location");

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(warehouseRepository.existsByName("Duplicate Name")).thenReturn(true);

        assertThatThrownBy(() -> warehouseService.updateWarehouse(1L, updateRequest))
                .isInstanceOf(DuplicateResourceException.class);

        verify(warehouseRepository, never()).save(any(Warehouse.class));
    }

    @Test
    void deleteWarehouse_WithNoProducts_ShouldDeleteSuccessfully() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));

        warehouseService.deleteWarehouse(1L);

        verify(warehouseRepository, times(1)).delete(warehouse);
    }

    @Test
    void deleteWarehouse_WithProducts_ShouldThrowException() {
        warehouse.getProducts().add(null); // Simulate having products

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));

        assertThatThrownBy(() -> warehouseService.deleteWarehouse(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete warehouse with existing products");

        verify(warehouseRepository, never()).delete(any(Warehouse.class));
    }

    @Test
    void setWarehouseActive_ShouldUpdateActiveStatus() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(warehouse);

        WarehouseResponse response = warehouseService.setWarehouseActive(1L, false);

        assertThat(response).isNotNull();
        verify(warehouseRepository, times(1)).save(warehouse);
    }
}

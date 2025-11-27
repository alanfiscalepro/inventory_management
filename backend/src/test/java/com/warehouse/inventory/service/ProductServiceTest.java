package com.warehouse.inventory.service;

import com.warehouse.inventory.dto.request.CreateProductRequest;
import com.warehouse.inventory.dto.response.ProductResponse;
import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.exception.DuplicateResourceException;
import com.warehouse.inventory.exception.ResourceNotFoundException;
import com.warehouse.inventory.repository.ProductRepository;
import com.warehouse.inventory.repository.ReservationRepository;
import com.warehouse.inventory.repository.TransactionRepository;
import com.warehouse.inventory.repository.WarehouseRepository;
import com.warehouse.inventory.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private CreateProductRequest createRequest;
    private Product product;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        warehouse = Warehouse.builder()
                .id(1L)
                .name("Test Warehouse")
                .location("Test Location")
                .active(true)
                .products(new ArrayList<>())
                .build();

        createRequest = new CreateProductRequest();
        createRequest.setSku("TEST-001");
        createRequest.setName("Test Product");
        createRequest.setDescription("Test Description");
        createRequest.setPrice(new BigDecimal("99.99"));
        createRequest.setQuantity(100);
        createRequest.setWarehouseId(1L);
        createRequest.setUnit("pcs");
        createRequest.setMinStockLevel(10);

        product = Product.builder()
                .id(1L)
                .sku("TEST-001")
                .name("Test Product")
                .description("Test Description")
                .price(new BigDecimal("99.99"))
                .quantity(100)
                .reservedQuantity(0)
                .unit("pcs")
                .minStockLevel(10)
                .active(true)
                .warehouse(warehouse)
                .build();
    }

    @Test
    void createProduct_ShouldReturnProductResponse() {
        when(productRepository.existsBySku(anyString())).thenReturn(false);
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductResponse response = productService.createProduct(createRequest);

        assertThat(response).isNotNull();
        assertThat(response.getSku()).isEqualTo("TEST-001");
        assertThat(response.getName()).isEqualTo("Test Product");
        assertThat(response.getQuantity()).isEqualTo(100);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void createProduct_WithDuplicateSku_ShouldThrowException() {
        when(productRepository.existsBySku(anyString())).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(createRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void createProduct_WithInvalidWarehouse_ShouldThrowException() {
        when(productRepository.existsBySku(anyString())).thenReturn(false);
        when(warehouseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.createProduct(createRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Warehouse not found");

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void getProductById_ShouldReturnProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getSku()).isEqualTo("TEST-001");
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void getProductById_WithInvalidId_ShouldThrowException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllProducts_ShouldReturnProductList() {
        Product product2 = Product.builder()
                .id(2L)
                .sku("TEST-002")
                .name("Product 2")
                .quantity(50)
                .reservedQuantity(0)
                .active(true)
                .warehouse(warehouse)
                .build();

        when(productRepository.findAll()).thenReturn(Arrays.asList(product, product2));

        List<ProductResponse> responses = productService.getAllProducts();

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getSku()).isEqualTo("TEST-001");
        assertThat(responses.get(1).getSku()).isEqualTo("TEST-002");
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void getProductsByWarehouse_ShouldReturnFilteredProducts() {
        when(productRepository.findByWarehouseId(1L)).thenReturn(Arrays.asList(product));

        List<ProductResponse> responses = productService.getProductsByWarehouse(1L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getWarehouseId()).isEqualTo(1L);
        verify(productRepository, times(1)).findByWarehouseId(1L);
    }

    @Test
    void updateProduct_ShouldReturnUpdatedProduct() {
        CreateProductRequest updateRequest = new CreateProductRequest();
        updateRequest.setSku("TEST-001-UPD");
        updateRequest.setName("Updated Product");
        updateRequest.setPrice(new BigDecimal("149.99"));
        updateRequest.setQuantity(150);
        updateRequest.setWarehouseId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(productRepository.existsBySku("TEST-001-UPD")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductResponse response = productService.updateProduct(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void updateProduct_WithDuplicateSku_ShouldThrowException() {
        CreateProductRequest updateRequest = new CreateProductRequest();
        updateRequest.setSku("DUPLICATE-SKU");
        updateRequest.setName("Product");
        updateRequest.setWarehouseId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySku("DUPLICATE-SKU")).thenReturn(true);

        assertThatThrownBy(() -> productService.updateProduct(1L, updateRequest))
                .isInstanceOf(DuplicateResourceException.class);

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void deleteProduct_WithNoReservations_ShouldDeleteSuccessfully() {
        product.setReservedQuantity(0);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).delete(product);
    }

    @Test
    void deleteProduct_WithActiveReservations_ShouldThrowException() {
        product.setReservedQuantity(10);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot delete product with active reservations");

        verify(productRepository, never()).delete(any(Product.class));
    }
}

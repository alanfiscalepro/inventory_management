package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Warehouse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    private Warehouse warehouse;
    private Product product;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        warehouseRepository.deleteAll();

        warehouse = Warehouse.builder()
                .name("Test Warehouse")
                .location("Test Location")
                .active(true)
                .build();
        warehouse = warehouseRepository.save(warehouse);

        product = Product.builder()
                .sku("TEST-001")
                .name("Test Product")
                .description("A test product")
                .quantity(100)
                .reservedQuantity(10)
                .price(new BigDecimal("99.99"))
                .unit("pcs")
                .minStockLevel(20)
                .active(true)
                .warehouse(warehouse)
                .build();
    }

    @Test
    void shouldSaveProduct() {
        Product saved = productRepository.save(product);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSku()).isEqualTo("TEST-001");
        assertThat(saved.getName()).isEqualTo("Test Product");
        assertThat(saved.getQuantity()).isEqualTo(100);
        assertThat(saved.getReservedQuantity()).isEqualTo(10);
        assertThat(saved.getAvailableQuantity()).isEqualTo(90);
        assertThat(saved.getWarehouse().getId()).isEqualTo(warehouse.getId());
    }

    @Test
    void shouldFindProductBySku() {
        productRepository.save(product);

        Optional<Product> found = productRepository.findBySku("TEST-001");

        assertThat(found).isPresent();
        assertThat(found.get().getSku()).isEqualTo("TEST-001");
    }

    @Test
    void shouldFindProductsByWarehouseId() {
        productRepository.save(product);

        Product product2 = Product.builder()
                .sku("TEST-002")
                .name("Test Product 2")
                .quantity(50)
                .reservedQuantity(0)
                .price(new BigDecimal("49.99"))
                .minStockLevel(10)
                .active(true)
                .warehouse(warehouse)
                .build();
        productRepository.save(product2);

        List<Product> products = productRepository.findByWarehouseId(warehouse.getId());

        assertThat(products).hasSize(2);
    }

    @Test
    void shouldFindActiveProducts() {
        productRepository.save(product);

        Product inactiveProduct = Product.builder()
                .sku("TEST-INACTIVE")
                .name("Inactive Product")
                .quantity(10)
                .reservedQuantity(0)
                .price(new BigDecimal("29.99"))
                .minStockLevel(5)
                .active(false)
                .warehouse(warehouse)
                .build();
        productRepository.save(inactiveProduct);

        List<Product> activeProducts = productRepository.findByActiveTrue();

        assertThat(activeProducts).hasSize(1);
        assertThat(activeProducts.get(0).getSku()).isEqualTo("TEST-001");
    }

    @Test
    void shouldFindLowStockProducts() {
        // Product with available quantity (90) > minStockLevel (20) - not low stock
        productRepository.save(product);

        // Product with available quantity (5) <= minStockLevel (20) - low stock
        Product lowStockProduct = Product.builder()
                .sku("LOW-STOCK")
                .name("Low Stock Product")
                .quantity(25)
                .reservedQuantity(20)
                .price(new BigDecimal("19.99"))
                .minStockLevel(20)
                .active(true)
                .warehouse(warehouse)
                .build();
        productRepository.save(lowStockProduct);

        List<Product> lowStockProducts = productRepository.findLowStockProducts();

        assertThat(lowStockProducts).hasSize(1);
        assertThat(lowStockProducts.get(0).getSku()).isEqualTo("LOW-STOCK");
        assertThat(lowStockProducts.get(0).isLowStock()).isTrue();
    }

    @Test
    void shouldCheckIfProductExistsBySku() {
        productRepository.save(product);

        boolean exists = productRepository.existsBySku("TEST-001");
        boolean notExists = productRepository.existsBySku("NON-EXISTENT");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldCalculateAvailableQuantity() {
        Product saved = productRepository.save(product);

        assertThat(saved.getAvailableQuantity()).isEqualTo(90); // 100 - 10
    }

    @Test
    void shouldDetermineLowStock() {
        product.setQuantity(25);
        product.setReservedQuantity(10);
        product.setMinStockLevel(20);

        Product saved = productRepository.save(product);

        assertThat(saved.isLowStock()).isTrue(); // available: 15, min: 20
    }
}

package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Warehouse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class WarehouseRepositoryTest {

    @Autowired
    private WarehouseRepository warehouseRepository;

    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        warehouseRepository.deleteAll();

        warehouse = Warehouse.builder()
                .name("Main Warehouse")
                .location("New York, NY")
                .description("Primary warehouse facility")
                .active(true)
                .build();
    }

    @Test
    void shouldSaveWarehouse() {
        Warehouse saved = warehouseRepository.save(warehouse);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Main Warehouse");
        assertThat(saved.getLocation()).isEqualTo("New York, NY");
        assertThat(saved.getActive()).isTrue();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldFindWarehouseByName() {
        warehouseRepository.save(warehouse);

        Optional<Warehouse> found = warehouseRepository.findByName("Main Warehouse");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Main Warehouse");
    }

    @Test
    void shouldReturnEmptyWhenWarehouseNameNotFound() {
        Optional<Warehouse> found = warehouseRepository.findByName("Non-existent");

        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindActiveWarehouses() {
        Warehouse activeWarehouse = warehouseRepository.save(warehouse);

        Warehouse inactiveWarehouse = Warehouse.builder()
                .name("Inactive Warehouse")
                .location("Los Angeles, CA")
                .active(false)
                .build();
        warehouseRepository.save(inactiveWarehouse);

        List<Warehouse> activeWarehouses = warehouseRepository.findByActiveTrue();

        assertThat(activeWarehouses).hasSize(1);
        assertThat(activeWarehouses.get(0).getName()).isEqualTo("Main Warehouse");
    }

    @Test
    void shouldCheckIfWarehouseExistsByName() {
        warehouseRepository.save(warehouse);

        boolean exists = warehouseRepository.existsByName("Main Warehouse");
        boolean notExists = warehouseRepository.existsByName("Non-existent");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldUpdateWarehouse() {
        Warehouse saved = warehouseRepository.save(warehouse);
        saved.setLocation("Boston, MA");

        Warehouse updated = warehouseRepository.save(saved);

        assertThat(updated.getLocation()).isEqualTo("Boston, MA");
        assertThat(updated.getVersion()).isEqualTo(1L);
    }

    @Test
    void shouldDeleteWarehouse() {
        Warehouse saved = warehouseRepository.save(warehouse);

        warehouseRepository.delete(saved);

        Optional<Warehouse> found = warehouseRepository.findById(saved.getId());
        assertThat(found).isEmpty();
    }
}

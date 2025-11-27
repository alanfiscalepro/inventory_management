package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Reservation;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ReservationRepositoryTest {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    private Product product;

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        productRepository.deleteAll();
        warehouseRepository.deleteAll();

        Warehouse warehouse = Warehouse.builder()
                .name("Test Warehouse")
                .location("Test Location")
                .active(true)
                .build();
        warehouse = warehouseRepository.save(warehouse);

        product = Product.builder()
                .sku("TEST-001")
                .name("Test Product")
                .quantity(100)
                .reservedQuantity(0)
                .price(new BigDecimal("99.99"))
                .minStockLevel(10)
                .active(true)
                .warehouse(warehouse)
                .build();
        product = productRepository.save(product);
    }

    @Test
    void shouldSaveReservation() {
        Reservation reservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .reservedBy("customer@example.com")
                .reference("ORDER-123")
                .notes("Customer order reservation")
                .product(product)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getQuantity()).isEqualTo(10);
        assertThat(saved.getStatus()).isEqualTo(ReservationStatus.ACTIVE);
        assertThat(saved.getReservedBy()).isEqualTo("customer@example.com");
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void shouldFindReservationsByProductId() {
        Reservation reservation1 = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .reservedBy("customer1@example.com")
                .product(product)
                .build();
        reservationRepository.save(reservation1);

        Reservation reservation2 = Reservation.builder()
                .quantity(5)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(3))
                .reservedBy("customer2@example.com")
                .product(product)
                .build();
        reservationRepository.save(reservation2);

        List<Reservation> reservations = reservationRepository.findByProductId(product.getId());

        assertThat(reservations).hasSize(2);
    }

    @Test
    void shouldFindReservationsByProductIdAndStatus() {
        Reservation activeReservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .product(product)
                .build();
        reservationRepository.save(activeReservation);

        Reservation fulfilledReservation = Reservation.builder()
                .quantity(5)
                .status(ReservationStatus.FULFILLED)
                .expiresAt(LocalDateTime.now().plusDays(3))
                .product(product)
                .build();
        reservationRepository.save(fulfilledReservation);

        List<Reservation> activeReservations = reservationRepository.findByProductIdAndStatus(
                product.getId(), ReservationStatus.ACTIVE);

        assertThat(activeReservations).hasSize(1);
        assertThat(activeReservations.get(0).getStatus()).isEqualTo(ReservationStatus.ACTIVE);
    }

    @Test
    void shouldFindExpiredReservations() {
        Reservation expiredReservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().minusDays(1))
                .product(product)
                .build();
        reservationRepository.save(expiredReservation);

        Reservation activeReservation = Reservation.builder()
                .quantity(5)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .product(product)
                .build();
        reservationRepository.save(activeReservation);

        List<Reservation> expiredReservations = reservationRepository.findExpiredReservations(
                LocalDateTime.now());

        assertThat(expiredReservations).hasSize(1);
        assertThat(expiredReservations.get(0).getExpiresAt()).isBefore(LocalDateTime.now());
    }

    @Test
    void shouldFindActiveReservationsByProduct() {
        Reservation activeReservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .product(product)
                .build();
        reservationRepository.save(activeReservation);

        Reservation expiredReservation = Reservation.builder()
                .quantity(5)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().minusDays(1))
                .product(product)
                .build();
        reservationRepository.save(expiredReservation);

        List<Reservation> activeReservations = reservationRepository.findActiveReservationsByProduct(
                product.getId(), LocalDateTime.now());

        assertThat(activeReservations).hasSize(1);
        assertThat(activeReservations.get(0).getExpiresAt()).isAfter(LocalDateTime.now());
    }

    @Test
    void shouldCheckIfReservationIsExpired() {
        Reservation reservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().minusHours(1))
                .product(product)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        assertThat(saved.isExpired()).isTrue();
        assertThat(saved.isActive()).isFalse();
    }

    @Test
    void shouldCheckIfReservationIsActive() {
        Reservation reservation = Reservation.builder()
                .quantity(10)
                .status(ReservationStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .product(product)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        assertThat(saved.isActive()).isTrue();
        assertThat(saved.isExpired()).isFalse();
    }
}

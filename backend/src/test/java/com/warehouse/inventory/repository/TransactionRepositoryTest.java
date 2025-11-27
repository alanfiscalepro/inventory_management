package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Product;
import com.warehouse.inventory.entity.Transaction;
import com.warehouse.inventory.entity.Warehouse;
import com.warehouse.inventory.entity.enums.TransactionType;
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
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    private Product product;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
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
    void shouldSaveTransaction() {
        Transaction transaction = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .notes("Restocking")
                .reference("PO-123")
                .product(product)
                .build();

        Transaction saved = transactionRepository.save(transaction);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getType()).isEqualTo(TransactionType.INBOUND);
        assertThat(saved.getQuantity()).isEqualTo(50);
        assertThat(saved.getQuantityBefore()).isEqualTo(100);
        assertThat(saved.getQuantityAfter()).isEqualTo(150);
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void shouldFindTransactionsByProductId() {
        Transaction transaction1 = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .product(product)
                .build();
        transactionRepository.save(transaction1);

        Transaction transaction2 = Transaction.builder()
                .type(TransactionType.OUTBOUND)
                .quantity(20)
                .quantityBefore(150)
                .quantityAfter(130)
                .product(product)
                .build();
        transactionRepository.save(transaction2);

        List<Transaction> transactions = transactionRepository.findByProductId(product.getId());

        assertThat(transactions).hasSize(2);
    }

    @Test
    void shouldFindTransactionsByProductIdOrderedByCreatedAtDesc() {
        Transaction oldTransaction = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .product(product)
                .build();
        transactionRepository.save(oldTransaction);

        Transaction newTransaction = Transaction.builder()
                .type(TransactionType.OUTBOUND)
                .quantity(20)
                .quantityBefore(150)
                .quantityAfter(130)
                .product(product)
                .build();
        transactionRepository.save(newTransaction);

        List<Transaction> transactions = transactionRepository.findByProductIdOrderByCreatedAtDesc(product.getId());

        assertThat(transactions).hasSize(2);
        assertThat(transactions.get(0).getType()).isEqualTo(TransactionType.OUTBOUND);
        assertThat(transactions.get(1).getType()).isEqualTo(TransactionType.INBOUND);
    }

    @Test
    void shouldFindTransactionsByType() {
        Transaction inbound = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .product(product)
                .build();
        transactionRepository.save(inbound);

        Transaction outbound = Transaction.builder()
                .type(TransactionType.OUTBOUND)
                .quantity(20)
                .quantityBefore(150)
                .quantityAfter(130)
                .product(product)
                .build();
        transactionRepository.save(outbound);

        List<Transaction> inboundTransactions = transactionRepository.findByType(TransactionType.INBOUND);

        assertThat(inboundTransactions).hasSize(1);
        assertThat(inboundTransactions.get(0).getType()).isEqualTo(TransactionType.INBOUND);
    }

    @Test
    void shouldFindTransactionsByDateRange() {
        Transaction transaction = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .product(product)
                .build();
        transactionRepository.save(transaction);

        LocalDateTime startDate = LocalDateTime.now().minusDays(1);
        LocalDateTime endDate = LocalDateTime.now().plusDays(1);

        List<Transaction> transactions = transactionRepository.findByProductIdAndDateRange(
                product.getId(), startDate, endDate);

        assertThat(transactions).hasSize(1);
    }

    @Test
    void shouldFindTransactionsByWarehouseId() {
        Transaction transaction = Transaction.builder()
                .type(TransactionType.INBOUND)
                .quantity(50)
                .quantityBefore(100)
                .quantityAfter(150)
                .product(product)
                .build();
        transactionRepository.save(transaction);

        List<Transaction> transactions = transactionRepository.findByWarehouseId(
                product.getWarehouse().getId());

        assertThat(transactions).hasSize(1);
        assertThat(transactions.get(0).getProduct().getWarehouse().getId())
                .isEqualTo(product.getWarehouse().getId());
    }
}

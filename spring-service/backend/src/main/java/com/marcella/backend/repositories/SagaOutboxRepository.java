package com.marcella.backend.repositories;

import com.marcella.backend.entities.SagaOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface SagaOutboxRepository extends JpaRepository<SagaOutbox, UUID> {

    /**
     * Uses idx_outbox_pending partial index (WHERE status = 'PENDING').
     * Partial indexes reduce index size and improve scan speed by only
     * indexing rows that match the WHERE clause — a key DBMS optimisation.
     */
    @Query(value = "SELECT * FROM saga_outbox WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT :limit", nativeQuery = true)
    List<SagaOutbox> findPendingMessages(@Param("limit") int limit);

    List<SagaOutbox> findBySagaId(UUID sagaId);
}

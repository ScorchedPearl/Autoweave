package com.marcella.backend.repositories;

import com.marcella.backend.entities.SagaStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SagaStepRepository extends JpaRepository<SagaStep, UUID> {

    /**
     * Uses idx_saga_steps_saga_order (saga_id, step_order ASC).
     * This is the B-Tree composite index that the Execution Explorer visualises.
     */
    List<SagaStep> findBySagaIdOrderByStepOrderAsc(UUID sagaId);

    Optional<SagaStep> findBySagaIdAndNodeId(UUID sagaId, String nodeId);

    /**
     * Partial query: steps that need compensation (committed, in reverse order)
     * used during saga rollback to determine which compensating transactions to run.
     */
    @Query("SELECT s FROM SagaStep s WHERE s.sagaId = :sagaId AND s.stepState = 'COMMITTED' ORDER BY s.stepOrder DESC")
    List<SagaStep> findCommittedStepsForCompensation(@Param("sagaId") UUID sagaId);
}

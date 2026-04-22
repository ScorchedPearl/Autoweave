package com.marcella.backend.repositories;

import com.marcella.backend.entities.SagaStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SagaStepRepository extends JpaRepository<SagaStep, UUID> {

    List<SagaStep> findBySagaIdOrderByStepOrderAsc(UUID sagaId);

    Optional<SagaStep> findBySagaIdAndNodeId(UUID sagaId, String nodeId);

    @Query("SELECT s FROM SagaStep s WHERE s.sagaId = :sagaId AND s.stepState = 'COMMITTED' ORDER BY s.stepOrder DESC")
    List<SagaStep> findCommittedStepsForCompensation(@Param("sagaId") UUID sagaId);
}

package com.marcella.backend.repositories;

import com.marcella.backend.entities.SagaInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SagaInstanceRepository extends JpaRepository<SagaInstance, UUID> {

    Optional<SagaInstance> findByExecutionId(UUID executionId);

    @Query("SELECT s FROM SagaInstance s WHERE s.workflowId = :workflowId ORDER BY s.startedAt DESC")
    List<SagaInstance> findByWorkflowId(@Param("workflowId") UUID workflowId);

    @Query("SELECT s FROM SagaInstance s WHERE s.sagaState IN ('STARTED', 'IN_PROGRESS', 'COMPENSATING') ORDER BY s.startedAt DESC")
    List<SagaInstance> findActive();
}

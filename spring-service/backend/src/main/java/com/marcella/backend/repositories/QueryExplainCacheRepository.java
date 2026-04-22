package com.marcella.backend.repositories;

import com.marcella.backend.entities.QueryExplainCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QueryExplainCacheRepository extends JpaRepository<QueryExplainCache, UUID> {

    Optional<QueryExplainCache> findTopByExecutionIdOrderByCapturedAtDesc(UUID executionId);

    @Query("SELECT q FROM QueryExplainCache q WHERE q.workflowId = :workflowId ORDER BY q.capturedAt DESC")
    List<QueryExplainCache> findLatestByWorkflow(@Param("workflowId") UUID workflowId);

    boolean existsByQueryFingerprintAndExecutionId(String fingerprint, UUID executionId);
}

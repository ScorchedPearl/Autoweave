package com.marcella.backend.controllers;

import com.marcella.backend.entities.QueryExplainCache;
import com.marcella.backend.repositories.QueryExplainCacheRepository;
import com.marcella.backend.services.BTreeExplainerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
@Slf4j
public class BTreeExplorerController {

    private final BTreeExplainerService explainerService;
    private final QueryExplainCacheRepository cacheRepository;

    @PostMapping("/explain/{executionId}")
    public ResponseEntity<ExplainResponse> triggerExplain(
            @PathVariable UUID executionId,
            @RequestParam UUID workflowId,
            @RequestParam UUID ownerId) {

        log.info("EXPLAIN request: executionId={} workflowId={}", executionId, workflowId);
        QueryExplainCache result = explainerService.explainExecutionQuery(ownerId, workflowId, executionId);
        return ResponseEntity.ok(toResponse(result));
    }

    @GetMapping("/explain/{executionId}")
    public ResponseEntity<ExplainResponse> getExplain(@PathVariable UUID executionId) {
        return cacheRepository.findTopByExecutionIdOrderByCapturedAtDesc(executionId)
                .map(c -> ResponseEntity.ok(toResponse(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workflow/{workflowId}/history")
    public ResponseEntity<List<ExplainResponse>> getWorkflowExplainHistory(
            @PathVariable UUID workflowId) {
        List<ExplainResponse> history = cacheRepository
                .findLatestByWorkflow(workflowId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(history);
    }

    private ExplainResponse toResponse(QueryExplainCache c) {
        boolean isIndexScan = c.getScanType() != null &&
                (c.getScanType().contains("Index") || c.getScanType().contains("Bitmap"));

        double speedupRatio = 1.0;
        if (c.getTotalRowsScanned() != null && c.getRowsReturned() != null && c.getRowsReturned() > 0) {
            speedupRatio = (double) c.getTotalRowsScanned() / c.getRowsReturned();
        }

        long n = c.getTotalRowsScanned() != null ? c.getTotalRowsScanned() : 1000L;
        int btreeDepth = c.getIndexDepth() != null ? c.getIndexDepth() : 3;
        long theoreticalBtreeOps = (long) (Math.log(n) / Math.log(2)); // O(log₂ N)
        long seqScanOps = n;

        return new ExplainResponse(
                c.getId(),
                c.getExecutionId(),
                c.getWorkflowId(),
                c.getScanType(),
                c.getIndexName(),
                btreeDepth,
                isIndexScan,
                c.getPlanningTimeMs(),
                c.getExecutionTimeMs(),
                c.getTotalRowsScanned(),
                c.getRowsReturned(),
                round(speedupRatio),
                theoreticalBtreeOps,
                seqScanOps,
                c.getExplainJson(),
                c.getCapturedAt().toString(),
                buildProfessorNarrative(c, isIndexScan, btreeDepth, n)
        );
    }

    private String buildProfessorNarrative(QueryExplainCache c, boolean isIndexScan, int depth, long n) {
        if (isIndexScan) {
            return String.format(
                    "PostgreSQL chose '%s' using the composite B-Tree index '%s'. " +
                    "The B-Tree has an estimated height of %d levels, meaning the engine " +
                    "performed approximately O(log₂(%d)) ≈ %d comparisons to locate the " +
                    "matching leaf pages — compared to %d comparisons for a full Sequential Scan. " +
                    "This is a %.1fx reduction in I/O operations, demonstrating the practical " +
                    "impact of B-Tree indexing on relational algebra selection (σ) operators.",
                    c.getScanType(), c.getIndexName() != null ? c.getIndexName() : "composite index",
                    depth, n, (long)(Math.log(n)/Math.log(2)), n,
                    n > 0 ? (double) n / Math.max(1, (long)(Math.log(n)/Math.log(2))) : 1.0
            );
        } else {
            return String.format(
                    "PostgreSQL chose a '%s'. This means the query planner determined " +
                    "a full scan of all %d rows was more efficient than using an index, " +
                    "likely because the selectivity was too low. " +
                    "Consider adding a more selective filter or a covering index to trigger " +
                    "an Index Scan for O(log N) performance instead of O(N).",
                    c.getScanType(), n
            );
        }
    }

    private double round(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    public record ExplainResponse(
            UUID id,
            UUID executionId,
            UUID workflowId,
            String scanType,
            String indexName,
            int indexDepth,
            boolean isIndexScan,
            BigDecimal planningTimeMs,
            BigDecimal executionTimeMs,
            Long totalRowsScanned,
            Long rowsReturned,
            double speedupRatio,
            long theoreticalBtreeOps,
            long theoreticalSeqScanOps,
            String rawExplainJson,
            String capturedAt,
            String professorNarrative
    ) {}
}

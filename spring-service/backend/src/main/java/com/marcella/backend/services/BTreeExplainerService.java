package com.marcella.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcella.backend.entities.QueryExplainCache;
import com.marcella.backend.repositories.QueryExplainCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BTreeExplainerService {

    @PersistenceContext
    private final EntityManager entityManager;

    private final QueryExplainCacheRepository explainCacheRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public QueryExplainCache explainExecutionQuery(UUID ownerId, UUID workflowId, UUID executionId) {

        if (executionId != null) {
            String fingerprint = buildFingerprint(ownerId, workflowId);
            if (explainCacheRepository.existsByQueryFingerprintAndExecutionId(fingerprint, executionId)) {
                return explainCacheRepository.findTopByExecutionIdOrderByCapturedAtDesc(executionId)
                        .orElseThrow();
            }
        }

        String targetSql = """
                SELECT id, status, started_at, completed_at, error
                FROM executions
                WHERE owner_id = '%s'::uuid
                  AND workflow_id = '%s'::uuid
                ORDER BY started_at DESC
                LIMIT 50
                """.formatted(ownerId, workflowId);

        String explainSql = "EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS) " + targetSql;

        log.debug("Running EXPLAIN ANALYZE: {}", explainSql);

        try {
            Object result = entityManager.createNativeQuery(explainSql).getSingleResult();
            String explainJson = result.toString();

            QueryExplainCache cached = parsePlan(explainJson, ownerId, workflowId, executionId);
            return explainCacheRepository.save(cached);
        } catch (Exception e) {
            log.error("DBMS Analysis failed for SQL: {}", explainSql, e);
            return QueryExplainCache.builder()
                    .executionId(executionId)
                    .workflowId(workflowId)
                    .ownerId(ownerId)
                    .queryFingerprint(buildFingerprint(ownerId, workflowId))
                    .scanType("Error")
                    .explainJson("{\"error\": \"" + e.getMessage() + "\"}")
                    .indexDepth(0)
                    .capturedAt(Instant.now())
                    .build();
        }
    }

    private QueryExplainCache parsePlan(String rawJson, UUID ownerId, UUID workflowId, UUID executionId) {
        try {
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode planRoot = root.isArray() ? root.get(0) : root;

            double planningTime = planRoot.path("Planning Time").asDouble(0.0);
            double execTime     = planRoot.path("Execution Time").asDouble(0.0);
            JsonNode planNode   = planRoot.path("Plan");

            ScanInfo scan = extractScanInfo(planNode);

            int btreeDepth = scan.rowsScanned > 0
                    ? (int) Math.ceil(Math.log(scan.rowsScanned) / Math.log(300))
                    : 3;
            btreeDepth = Math.max(1, btreeDepth);

            return QueryExplainCache.builder()
                    .executionId(executionId)
                    .workflowId(workflowId)
                    .ownerId(ownerId)
                    .queryFingerprint(buildFingerprint(ownerId, workflowId))
                    .explainJson(rawJson)
                    .scanType(scan.nodeType)
                    .indexName(scan.indexName)
                    .indexDepth(btreeDepth)
                    .planningTimeMs(BigDecimal.valueOf(planningTime))
                    .executionTimeMs(BigDecimal.valueOf(execTime))
                    .totalRowsScanned(scan.rowsScanned)
                    .rowsReturned(scan.rowsReturned)
                    .capturedAt(Instant.now())
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse EXPLAIN JSON", e);
            return QueryExplainCache.builder()
                    .executionId(executionId)
                    .workflowId(workflowId)
                    .ownerId(ownerId)
                    .queryFingerprint(buildFingerprint(ownerId, workflowId))
                    .explainJson(rawJson)
                    .scanType("Parsing Error")
                    .indexDepth(0)
                    .capturedAt(Instant.now())
                    .build();
        }
    }

    private ScanInfo extractScanInfo(JsonNode node) {
        if (node == null || node.isNull()) return new ScanInfo("Unknown", null, 0L, 0L);

        String nodeType     = node.path("Node Type").asText("Unknown");
        String indexName    = node.path("Index Name").asText(null);
        long rowsScanned    = node.path("Actual Rows").asLong(0) + node.path("Rows Removed by Filter").asLong(0);
        long rowsReturned   = node.path("Actual Rows").asLong(0);

        boolean isScan = nodeType.contains("Scan") || nodeType.contains("Index");
        if (isScan) {
            return new ScanInfo(nodeType, indexName, rowsScanned, rowsReturned);
        }

        JsonNode plans = node.path("Plans");
        if (plans.isArray()) {
            for (JsonNode child : plans) {
                ScanInfo childScan = extractScanInfo(child);
                if (!"Unknown".equals(childScan.nodeType)) {
                    return childScan;
                }
            }
        }
        return new ScanInfo(nodeType, indexName, rowsScanned, rowsReturned);
    }

    private String buildFingerprint(UUID ownerId, UUID workflowId) {
        try {
            String raw = ownerId.toString() + "::" + workflowId.toString();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception e) {
            return ownerId.toString().substring(0, 8);
        }
    }

    private record ScanInfo(String nodeType, String indexName, long rowsScanned, long rowsReturned) {}
}
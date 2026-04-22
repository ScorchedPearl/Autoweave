package com.marcella.backend.entities;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "query_explain_cache")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QueryExplainCache {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "execution_id")
    private UUID executionId;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "query_fingerprint", nullable = false)
    private String queryFingerprint;

    @Type(JsonBinaryType.class)
    @Column(name = "explain_json", columnDefinition = "jsonb", nullable = false)
    private String explainJson;

    @Column(name = "scan_type", nullable = false, length = 50)
    private String scanType;

    @Column(name = "index_name")
    private String indexName;

    @Column(name = "index_depth")
    private Integer indexDepth;

    @Column(name = "planning_time_ms", precision = 10, scale = 3)
    private BigDecimal planningTimeMs;

    @Column(name = "execution_time_ms", precision = 10, scale = 3)
    private BigDecimal executionTimeMs;

    @Column(name = "total_rows_scanned")
    private Long totalRowsScanned;

    @Column(name = "rows_returned")
    private Long rowsReturned;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;
}

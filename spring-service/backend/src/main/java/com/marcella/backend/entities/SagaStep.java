package com.marcella.backend.entities;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saga_steps")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SagaStep {

    @Id
    @GeneratedValue
    private UUID stepId;

    @Column(name = "saga_id", nullable = false)
    private UUID sagaId;

    @Column(name = "node_id", nullable = false)
    private String nodeId;

    @Column(name = "node_type", nullable = false)
    private String nodeType;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_state", nullable = false, length = 50)
    private String stepState;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "compensated_at")
    private Instant compensatedAt;

    @Type(JsonBinaryType.class)
    @Column(name = "compensation_payload", columnDefinition = "jsonb")
    private String compensationPayload;

    @Column(name = "compensation_topic")
    private String compensationTopic;

    @Type(JsonBinaryType.class)
    @Column(name = "output_snapshot", columnDefinition = "jsonb")
    private String outputSnapshot;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}

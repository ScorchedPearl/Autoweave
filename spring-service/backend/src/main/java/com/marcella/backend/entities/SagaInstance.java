package com.marcella.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saga_instances")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SagaInstance {

    @Id
    @GeneratedValue
    private UUID sagaId;

    @Column(name = "execution_id", nullable = false, unique = true)
    private UUID executionId;

    @Column(name = "workflow_id", nullable = false)
    private UUID workflowId;

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "saga_state", nullable = false, length = 50)
    private String sagaState;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "compensated_at")
    private Instant compensatedAt;

    @Column(name = "failed_reason")
    private String failedReason;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}

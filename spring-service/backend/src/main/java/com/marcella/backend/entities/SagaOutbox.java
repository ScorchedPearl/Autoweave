package com.marcella.backend.entities;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.Instant;
import java.util.UUID;

/**
 * Outbox table for the Transactional Outbox Pattern.
 *
 * PROFESSOR PITCH — Atomicity guarantee:
 * A traditional approach would: (1) save saga step to DB, then (2) publish to Kafka.
 * If the service crashes between steps 1 and 2, the event is LOST — breaking
 * Atomicity. The Outbox pattern solves this by writing the Kafka event as a DB row
 * IN THE SAME TRANSACTION as the saga step update. A separate @Scheduled relay then
 * polls PENDING outbox rows and publishes them to Kafka, marking them PUBLISHED.
 * This guarantees at-least-once delivery with idempotent consumers = effective
 * exactly-once semantics across the distributed boundary.
 */
@Entity
@Table(name = "saga_outbox")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SagaOutbox {

    @Id
    @GeneratedValue
    private UUID outboxId;

    @Column(name = "saga_id", nullable = false)
    private UUID sagaId;

    @Column(name = "step_id")
    private UUID stepId;

    @Column(name = "kafka_topic", nullable = false)
    private String kafkaTopic;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Type(JsonBinaryType.class)
    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount;

    @Column(name = "last_error")
    private String lastError;
}

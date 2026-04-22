package com.marcella.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcella.backend.entities.*;
import com.marcella.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagaCoordinatorService {

    private final SagaInstanceRepository sagaInstanceRepo;
    private final SagaStepRepository sagaStepRepo;
    private final SagaOutboxRepository outboxRepo;

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public SagaInstance startSaga(UUID executionId, UUID workflowId) {
        SagaInstance saga = SagaInstance.builder()
                .executionId(executionId)
                .workflowId(workflowId)
                .sagaState("STARTED")
                .startedAt(Instant.now())
                .version(0L)
                .build();
        saga = sagaInstanceRepo.save(saga);
        log.info("🟢 Saga STARTED: sagaId={} executionId={}", saga.getSagaId(), executionId);
        return saga;
    }

    @Transactional
    public SagaStep registerStep(UUID sagaId, String nodeId, String nodeType,
                                 int stepOrder, String compensationPayload,
                                 String compensationTopic) {
        SagaStep step = SagaStep.builder()
                .sagaId(sagaId)
                .nodeId(nodeId)
                .nodeType(nodeType)
                .stepOrder(stepOrder)
                .stepState("EXECUTING")
                .startedAt(Instant.now())
                .compensationPayload(compensationPayload)
                .compensationTopic(compensationTopic)
                .build();

        step = sagaStepRepo.save(step);
        writeOutbox(sagaId, step.getStepId(), "saga-node-events", "STEP_EXECUTING",
                Map.of("sagaId", sagaId, "nodeId", nodeId, "stepState", "EXECUTING",
                        "stepOrder", stepOrder, "nodeType", nodeType));

        return step;
    }

    @Transactional
    public void commitStep(UUID sagaId, String nodeId, String outputSnapshot) {
        SagaStep step = sagaStepRepo.findBySagaIdAndNodeId(sagaId, nodeId)
                .orElseThrow(() -> new IllegalStateException("Step not found: " + nodeId));

        step.setStepState("COMMITTED");
        step.setCompletedAt(Instant.now());
        step.setOutputSnapshot(outputSnapshot);
        sagaStepRepo.save(step);

        writeOutbox(sagaId, step.getStepId(), "saga-node-events", "STEP_COMMITTED",
                Map.of("sagaId", sagaId, "nodeId", nodeId, "stepState", "COMMITTED",
                        "stepOrder", step.getStepOrder(), "nodeType", step.getNodeType()));

        log.info("✅ Step COMMITTED: sagaId={} nodeId={}", sagaId, nodeId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void failStepAndCompensate(UUID sagaId, String nodeId, String errorMessage) {
        log.error("❌ Step FAILED: sagaId={} nodeId={} error={}", sagaId, nodeId, errorMessage);

        sagaStepRepo.findBySagaIdAndNodeId(sagaId, nodeId).ifPresent(step -> {
            step.setStepState("FAILED");
            step.setErrorMessage(errorMessage);
            step.setCompletedAt(Instant.now());
            sagaStepRepo.save(step);

            writeOutbox(sagaId, step.getStepId(), "saga-node-events", "STEP_FAILED",
                    Map.of("sagaId", sagaId, "nodeId", nodeId, "stepState", "FAILED",
                            "error", errorMessage, "stepOrder", step.getStepOrder(),
                            "nodeType", step.getNodeType()));
        });

        List<SagaStep> committedSteps = sagaStepRepo.findCommittedStepsForCompensation(sagaId);
        log.info("🔄 Starting compensation cascade for {} committed steps", committedSteps.size());

        for (SagaStep committed : committedSteps) {
            committed.setStepState("COMPENSATING");
            sagaStepRepo.save(committed);

            writeOutbox(sagaId, committed.getStepId(),
                    committed.getCompensationTopic() != null ? committed.getCompensationTopic() : "saga-compensation",
                    "COMPENSATE_NODE",
                    Map.of("sagaId", sagaId,
                            "nodeId", committed.getNodeId(),
                            "nodeType", committed.getNodeType(),
                            "stepOrder", committed.getStepOrder(),
                            "stepState", "COMPENSATING",
                            "compensationPayload", safeDeserialize(committed.getCompensationPayload())));
        }
    }

    @Transactional
    public void acknowledgeCompensation(UUID sagaId, String nodeId) {
        sagaStepRepo.findBySagaIdAndNodeId(sagaId, nodeId).ifPresent(step -> {
            step.setStepState("COMPENSATED");
            step.setCompensatedAt(Instant.now());
            sagaStepRepo.save(step);

            writeOutbox(sagaId, step.getStepId(), "saga-node-events", "STEP_COMPENSATED",
                    Map.of("sagaId", sagaId, "nodeId", nodeId, "stepState", "COMPENSATED",
                            "stepOrder", step.getStepOrder(), "nodeType", step.getNodeType()));
        });
        log.info("🟠 Compensation acknowledged: sagaId={} nodeId={}", sagaId, nodeId);
    }

    private void writeOutbox(UUID sagaId, UUID stepId, String topic, String eventType,
                             Map<String, Object> payload) {
        try {
            SagaOutbox outbox = SagaOutbox.builder()
                    .sagaId(sagaId)
                    .stepId(stepId)
                    .kafkaTopic(topic)
                    .eventType(eventType)
                    .payload(objectMapper.writeValueAsString(payload))
                    .status("PENDING")
                    .createdAt(Instant.now())
                    .retryCount(0)
                    .build();
            outboxRepo.save(outbox);
        }
        catch (Exception e) {
            log.error("Failed to write outbox event type={}", eventType, e);
            throw new RuntimeException("Outbox write failed — transaction must roll back", e);
        }
    }

    @Scheduled(fixedDelay = 500)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void relayOutboxMessages() {
        List<SagaOutbox> pending = outboxRepo.findPendingMessages(50);
        if (pending.isEmpty()) return;

        log.debug("Relaying {} outbox messages to Kafka", pending.size());

        for (SagaOutbox msg : pending) {
            try {
                kafkaTemplate.send(msg.getKafkaTopic(), msg.getSagaId().toString(), msg.getPayload())
                        .get();
                msg.setStatus("PUBLISHED");
                msg.setPublishedAt(Instant.now());
            } catch (Exception e) {
                log.warn("Outbox relay failed for outboxId={}, will retry. Error: {}", msg.getOutboxId(), e.getMessage());
                msg.setRetryCount(msg.getRetryCount() + 1);
                msg.setLastError(e.getMessage());
                if (msg.getRetryCount() >= 5) {
                    msg.setStatus("FAILED");
                    log.error("Outbox message permanently failed after 5 retries: {}", msg.getOutboxId());
                }
            }
            outboxRepo.save(msg);
        }
    }

    @Transactional(readOnly = true)
    public Optional<SagaInstance> getSagaForExecution(UUID executionId) {
        return sagaInstanceRepo.findByExecutionId(executionId);
    }

    @Transactional(readOnly = true)
    public List<SagaStep> getStepsForSaga(UUID sagaId) {
        return sagaStepRepo.findBySagaIdOrderByStepOrderAsc(sagaId);
    }

    @Transactional(readOnly = true)
    public List<SagaInstance> getActiveSagas() {
        return sagaInstanceRepo.findActive();
    }

    private Map<String, Object> safeDeserialize(String json) {
        try {
            if (json == null || json.isBlank()) return Map.of();
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of("raw", json);
        }
    }
}
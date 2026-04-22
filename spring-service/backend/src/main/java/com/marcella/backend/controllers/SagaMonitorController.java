package com.marcella.backend.controllers;

import com.marcella.backend.entities.SagaInstance;
import com.marcella.backend.entities.SagaStep;
import com.marcella.backend.services.SagaCoordinatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/saga")
@RequiredArgsConstructor
@Slf4j
public class SagaMonitorController {

    private final SagaCoordinatorService sagaCoordinator;

    @GetMapping("/execution/{executionId}/status")
    public ResponseEntity<SagaStatusResponse> getSagaStatus(@PathVariable UUID executionId) {
        return sagaCoordinator.getSagaForExecution(executionId)
                .map(saga -> {
                    List<SagaStep> steps = sagaCoordinator.getStepsForSaga(saga.getSagaId());
                    return ResponseEntity.ok(toStatusResponse(saga, steps));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SagaStatusResponse>> getActiveSagas() {
        List<SagaStatusResponse> active = sagaCoordinator.getActiveSagas()
                .stream()
                .map(saga -> {
                    List<SagaStep> steps = sagaCoordinator.getStepsForSaga(saga.getSagaId());
                    return toStatusResponse(saga, steps);
                })
                .toList();
        return ResponseEntity.ok(active);
    }

    @PostMapping("/execution/{executionId}/simulate-failure")
    public ResponseEntity<Map<String, Object>> simulateFailure(
            @PathVariable UUID executionId,
            @RequestParam String nodeId,
            @RequestParam(defaultValue = "Simulated failure for demo") String reason) {

        return sagaCoordinator.getSagaForExecution(executionId)
                .map(saga -> {
                    sagaCoordinator.failStepAndCompensate(saga.getSagaId(), nodeId, reason);
                    return ResponseEntity.ok(Map.<String, Object>of(
                            "message", "Compensation cascade initiated",
                            "sagaId", saga.getSagaId(),
                            "failedNode", nodeId
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private SagaStatusResponse toStatusResponse(SagaInstance saga, List<SagaStep> steps) {
        List<StepStatus> stepStatuses = steps.stream()
                .map(s -> {
                    long durationMs = 0;
                    if (s.getStartedAt() != null && s.getCompletedAt() != null) {
                        durationMs = s.getCompletedAt().toEpochMilli() - s.getStartedAt().toEpochMilli();
                    }
                    return new StepStatus(
                            s.getStepId(),
                            s.getNodeId(),
                            s.getNodeType(),
                            s.getStepOrder(),
                            s.getStepState(),
                            nodeColor(s.getStepState()),
                            s.getStartedAt() != null ? s.getStartedAt().toString() : null,
                            s.getCompletedAt() != null ? s.getCompletedAt().toString() : null,
                            s.getCompensatedAt() != null ? s.getCompensatedAt().toString() : null,
                            s.getErrorMessage(),
                            s.getCompensationPayload() != null,
                            s.getOutputSnapshot(),
                            s.getCompensationPayload(),
                            durationMs
                    );
                })
                .collect(Collectors.toList());

        return new SagaStatusResponse(
                saga.getSagaId(),
                saga.getExecutionId(),
                saga.getWorkflowId(),
                saga.getSagaState(),
                sagaColor(saga.getSagaState()),
                saga.getCurrentStep(),
                saga.getStartedAt() != null ? saga.getStartedAt().toString() : null,
                saga.getCompletedAt() != null ? saga.getCompletedAt().toString() : null,
                saga.getCompensatedAt() != null ? saga.getCompensatedAt().toString() : null,
                stepStatuses,
                buildSagaNarrative(saga, steps)
        );
    }

    private String nodeColor(String stepState) {
        return switch (stepState) {
                case "COMMITTED"   -> "#22c55e";
                case "EXECUTING"   -> "#3b82f6";
                case "COMPENSATING"-> "#f97316";
                case "COMPENSATED" -> "#fb923c";
                case "FAILED"      -> "#ef4444";
                default            -> "#6b7280";
        };
    }

    private String sagaColor(String sagaState) {
        return switch (sagaState) {
                case "COMPLETED"   -> "#22c55e";
                case "IN_PROGRESS" -> "#3b82f6";
                case "COMPENSATING"-> "#f97316";
                case "COMPENSATED" -> "#fb923c";
                case "FAILED"      -> "#ef4444";
                default            -> "#6b7280";
        };
    }

    private String buildSagaNarrative(SagaInstance saga, List<SagaStep> steps) {
        long committed   = steps.stream().filter(s -> "COMMITTED".equals(s.getStepState())).count();
        long compensated = steps.stream().filter(s -> "COMPENSATED".equals(s.getStepState())).count();
        long failed      = steps.stream().filter(s -> "FAILED".equals(s.getStepState())).count();

        return switch (saga.getSagaState()) {
            case "COMPLETED" -> String.format(
                    "Saga COMPLETED successfully. All %d distributed steps committed atomically. " +
                    "Data consistency maintained across Kafka, Gmail, and Postgres services " +
                    "without a 2-Phase Commit lock.", committed);
            case "COMPENSATING", "COMPENSATED" -> String.format(
                    "Step failure triggered a Compensation Cascade. %d previously committed " +
                    "steps are being rolled back in reverse topological order via their stored " +
                    "compensating transactions. This maintains eventual consistency without " +
                    "distributed locks — a key advantage of the Saga pattern over 2PC.", compensated);
            case "FAILED" -> String.format(
                    "%d step(s) failed without recoverable compensation. The saga is in a " +
                    "terminal FAILED state. A human-in-the-loop intervention or dead-letter " +
                    "queue processing is required.", failed);
            default -> String.format(
                    "Saga IN_PROGRESS: %d/%d steps committed so far.", committed, steps.size());
        };
    }

    public record SagaStatusResponse(
            UUID sagaId,
            UUID executionId,
            UUID workflowId,
            String sagaState,
            String sagaColor,
            String currentStep,
            String startedAt,
            String completedAt,
            String compensatedAt,
            List<StepStatus> steps,
            String sagaNarrative
    ) {}

    public record StepStatus(
            UUID stepId,
            String nodeId,
            String nodeType,
            int stepOrder,
            String stepState,
            String color,
            String startedAt,
            String completedAt,
            String compensatedAt,
            String errorMessage,
            boolean hasCompensation,
            String outputSnapshot,       
            String compensationPayload,  
            long durationMs      
    ) {}
}

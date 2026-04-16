package com.marcella.backend.controllers;

import com.marcella.backend.entities.Execution;
import com.marcella.backend.entities.Users;
import com.marcella.backend.repositories.ExecutionRepository;
import com.marcella.backend.repositories.UserRepository;
import com.marcella.backend.responses.PageResponse;
import com.marcella.backend.services.*;
import com.marcella.backend.workflow.CreateWorkflowRequest;
import com.marcella.backend.workflow.WorkflowDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/workflows")
@Validated
@RequiredArgsConstructor
@Slf4j
public class WorkflowController {

    private final WorkflowService workflowService;
    private final DistributedWorkflowCoordinator workflowCoordinator;
    private final JwtService jwtService;
    private final ExecutionRepository executionRepository;
    private final ReturnHandlerService returnHandler;
    private final ExecutionContextService executionContextService;

    private final BTreeExplainerService bTreeExplainerService;
    private final SagaCoordinatorService sagaCoordinator;
    private final UserRepository userRepository;

    @GetMapping("/{workflowId}/executions/{executionId}/explain")
    public ResponseEntity<?> explainExecutionPlan(
            @PathVariable UUID workflowId,
            @PathVariable UUID executionId,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);

        log.info("📊 Database physical layer trace requested by user: {}", userId);
        return ResponseEntity.ok(bTreeExplainerService.explainExecutionQuery(userId, workflowId, executionId));
    }

    @GetMapping("/executions/{executionId}/saga")
    public ResponseEntity<?> getSagaStatus(@PathVariable UUID executionId) {
        return sagaCoordinator.getSagaForExecution(executionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageResponse<WorkflowDto>> getWorkflows(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        UUID userId = getUserIdFromAuth(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());

        Page<WorkflowDto> workflows = workflowService.getWorkflows(userId, search, pageable);
        return ResponseEntity.ok(PageResponse.of(workflows));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowDto> getWorkflow(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        WorkflowDto workflow = workflowService.getWorkflow(id, userId);
        return ResponseEntity.ok(workflow);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkflowDto createWorkflow(
            @Valid @RequestBody CreateWorkflowRequest request,
            Authentication authentication
    ) {
        UUID userId = getUserIdFromAuth(authentication);
        return workflowService.createWorkflow(request, userId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowDto> updateWorkflow(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWorkflowRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        WorkflowDto updated = workflowService.updateWorkflow(id, request, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        workflowService.deleteWorkflow(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<WorkflowDto> duplicateWorkflow(
            @PathVariable UUID id,
            @RequestParam(required = false) String name,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        WorkflowDto duplicated = workflowService.duplicateWorkflow(id, userId, name);
        return ResponseEntity.ok(duplicated);
    }

    @PostMapping("/{workflowId}/run")
    public ResponseEntity<Map<String, Object>> runWorkflow(
            @PathVariable UUID workflowId,
            @RequestBody(required = false) Map<String, Object> requestBody,
            HttpServletRequest request
    ) {
        log.info("Run workflow request: {}", requestBody);
        try {
            Map<String, Object> payload = new HashMap<>();
            boolean waitForCompletion = false;
            long timeoutMs = 300000;
            List<String> returnVariables = Collections.emptyList();

            if (requestBody != null) {
                if (requestBody.containsKey("payload") || requestBody.containsKey("returnVariables") || requestBody.containsKey("waitForCompletion")) {
                    Map<String, Object> payloadMap = (Map<String, Object>) requestBody.get("payload");
                    if (payloadMap != null) {
                        payload.putAll(payloadMap);
                    }
                    if (requestBody.get("returnVariables") instanceof List) {
                        returnVariables = (List<String>) requestBody.get("returnVariables");
                    }
                    waitForCompletion = Boolean.TRUE.equals(requestBody.get("waitForCompletion"));
                    if (requestBody.containsKey("timeoutMs")) {
                        timeoutMs = ((Number) requestBody.get("timeoutMs")).longValue();
                    }
                } else if (requestBody.containsKey("payload")) {
                    payload.putAll((Map<String, Object>) requestBody.get("payload"));
                }
            }

            log.info("🚀 Starting workflow execution: {} with payload keys: {}, return variables: {}, wait: {}",
                    workflowId, payload.keySet(), returnVariables, waitForCompletion);

            String googleToken = request.getHeader("X-Google-Access-Token");
            if (googleToken != null && !googleToken.isBlank()) {
                payload.put("googleAccessToken", googleToken);
                log.info("✅ Added Google access token to payload");
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                try {
                    String userEmail = jwtService.extractEmail(jwt);
                    payload.put("user_email", userEmail);
                } catch (Exception e) {
                    log.warn("⚠️ Failed to extract user email from JWT: {}", e.getMessage());
                }
            }

            payload.put("execution_started_at", Instant.now().toString());
            payload.put("workflow_id", workflowId.toString());

            UUID executionId = workflowCoordinator.startWorkflowExecution(workflowId, payload, returnVariables);

            if (waitForCompletion) {
                return waitForExecutionCompletion(executionId, timeoutMs);
            } else {
                return ResponseEntity.ok(Map.of(
                        "message", "Workflow execution started successfully",
                        "workflowId", workflowId,
                        "executionId", executionId,
                        "status", "INITIATED",
                        "waitForCompletion", false,
                        "returnVariables", returnVariables != null ? returnVariables : List.of(),
                        "timestamp", Instant.now().toString()
                ));
            }

        } catch (Exception e) {
            log.error("❌ Failed to start workflow execution: {}", workflowId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "workflowId", workflowId,
                    "status", "FAILED",
                    "timestamp", Instant.now().toString()
            ));
        }
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Users user) {
            return user.getId();
        }
        return userRepository.findByEmail(authentication.getName())
                .map(Users::getId)
                .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
    }

    @PostMapping("/{workflowId}/run-sync")
    public ResponseEntity<Map<String, Object>> runWorkflowSync(
            @PathVariable UUID workflowId,
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) List<String> returnVariables,
            @RequestParam(defaultValue = "300000") long timeoutMs,
            HttpServletRequest httpRequest
    ) {
        Map<String, Object> request = new HashMap<>();
        request.put("payload", payload != null ? payload : new HashMap<>());
        request.put("returnVariables", returnVariables);
        request.put("waitForCompletion", true);
        request.put("timeoutMs", timeoutMs);

        return runWorkflow(workflowId, request, httpRequest);
    }

    private ResponseEntity<Map<String, Object>> waitForExecutionCompletion(UUID executionId, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        long endTime = startTime + timeoutMs;

        log.info("⏳ Waiting for execution completion: {} (timeout: {}ms)", executionId, timeoutMs);

        try {
            while (System.currentTimeMillis() < endTime) {
                Execution execution = executionRepository.findById(executionId).orElse(null);

                if (execution == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "error", "Execution not found",
                            "executionId", executionId,
                            "status", "NOT_FOUND"
                    ));
                }

                String status = execution.getStatus();

                if ("COMPLETED".equals(status)) {
                    log.info("✅ Execution completed successfully: {}", executionId);
                    Map<String, Object> result = returnHandler.createReturnPayload(executionId, "COMPLETED");
                    returnHandler.clearReturnVariables(executionId);
                    executionContextService.clearExecution(executionId);
                    return ResponseEntity.ok(result);

                } else if ("FAILED".equals(status)) {
                    log.error("❌ Execution failed: {}", executionId);
                    Map<String, Object> result = returnHandler.createReturnPayload(executionId, "FAILED");
                    result.put("error", execution.getError());
                    returnHandler.clearReturnVariables(executionId);
                    return ResponseEntity.ok(result);
                }

                Thread.sleep(1000);
            }

            log.warn("⏰ Execution timeout reached: {}", executionId);
            Map<String, Object> result = returnHandler.createReturnPayload(executionId, "TIMEOUT");
            result.put("error", "Execution timeout after " + timeoutMs + "ms");
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(result);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("🛑 Execution waiting interrupted: {}", executionId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Interrupted"));
        } catch (Exception e) {
            log.error("💥 Error while waiting for execution: {}", executionId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
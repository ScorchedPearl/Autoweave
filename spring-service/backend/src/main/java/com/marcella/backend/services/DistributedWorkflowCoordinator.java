package com.marcella.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcella.backend.entities.Execution;
import com.marcella.backend.entities.Workflows;
import com.marcella.backend.repositories.ExecutionRepository;
import com.marcella.backend.repositories.WorkflowRepository;
import com.marcella.backend.workflow.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistributedWorkflowCoordinator {
    private final WorkflowRepository workflowRepository;
    private final ExecutionContextService contextService;
    private final KahnAlgoService kahnService;
    private final WorkflowEventProducer eventProducer;
    private final ExecutionService executionService;
    private final WorkflowDefinitionParser workflowDefinitionParser;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ExecutionRepository executionRepository;
    private final ReturnHandlerService returnHandler;
    private final SagaCoordinatorService sagaCoordinator;
    private final ObjectMapper objectMapper;

    public UUID startWorkflowExecution(UUID workflowId, Map<String, Object> payload, List<String> returnVariables) {
        log.info("Starting workflow execution: {} with return variables: {}", workflowId, returnVariables);

        Workflows workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        Execution execution = executionService.startExecution(workflow);
        UUID executionId = execution.getId();

        try {
            sagaCoordinator.startSaga(executionId, workflowId);

            WorkflowDefinition workflowDef = workflowDefinitionParser.parseWorkflowDefinition(workflow);

            if (returnVariables != null && !returnVariables.isEmpty()) {
                returnHandler.storeReturnVariables(executionId, returnVariables);
            }

            initializeExecutionContext(executionId, workflowDef, payload);

            DependencyGraph dependencyGraph = kahnService.buildDependencyGraph(workflowDef);
            contextService.storeDependencyGraph(executionId, dependencyGraph);

            List<String> readyNodes = kahnService.getInitialReadyNodes(dependencyGraph);
            if (readyNodes.isEmpty()) {
                throw new RuntimeException("No ready nodes found - workflow may have circular dependencies");
            }

            contextService.addReadyNodes(executionId, readyNodes);
            routeNodesToServices(executionId, readyNodes, workflowDef);

            return executionId;

        } catch (Exception e) {
            log.error("Failed to start workflow execution", e);
            executionService.failExecution(execution, e.getMessage());
            returnHandler.clearReturnVariables(executionId);
            throw new RuntimeException("Workflow start failed: " + e.getMessage(), e);
        }
    }

    public void handleNodeCompletion(NodeCompletionMessage completionMessage) {
        UUID executionId = completionMessage.getExecutionId();
        String completedNodeId = completionMessage.getNodeId();

        log.info("Processing completion for node: {} in execution: {}", completedNodeId, executionId);

        try {
            String outputJson = "{}";
            if (completionMessage.getOutput() != null && !completionMessage.getOutput().isEmpty()) {
                outputJson = objectMapper.writeValueAsString(completionMessage.getOutput());
            }

            final String finalOutputJson = outputJson;
            sagaCoordinator.getSagaForExecution(executionId).ifPresent(saga -> {
                sagaCoordinator.commitStep(saga.getSagaId(), completedNodeId, finalOutputJson);
            });

            if (completionMessage.getOutput() != null) {
                updateStateAndPromoteVariables(executionId, completedNodeId, completionMessage.getOutput());
            }

            List<String> newlyReadyNodes = kahnService.processNodeCompletion(executionId, completedNodeId);

            if (!newlyReadyNodes.isEmpty()) {
                contextService.addReadyNodes(executionId, newlyReadyNodes);
                ExecutionContext context = contextService.getContext(executionId);
                Workflows workflow = workflowRepository.findById(context.getWorkflowId()).orElseThrow();
                WorkflowDefinition workflowDef = workflowDefinitionParser.parseWorkflowDefinition(workflow);
                routeNodesToServices(executionId, newlyReadyNodes, workflowDef);
            } else if (kahnService.isWorkflowComplete(executionId)) {
                completeWorkflowExecution(executionId);
            }

        } catch (Exception e) {
            log.error("Node completion error for node: {}", completedNodeId, e);
            sagaCoordinator.getSagaForExecution(executionId).ifPresent(saga ->
                    sagaCoordinator.failStepAndCompensate(saga.getSagaId(), completedNodeId, e.getMessage())
            );
            Execution execution = executionRepository.findById(executionId).orElse(null);
            if (execution != null) {
                executionService.failExecution(execution, "Node completion failed: " + e.getMessage());
                returnHandler.clearReturnVariables(executionId);
            }
        }
    }

    private void updateStateAndPromoteVariables(UUID executionId, String nodeId, Map<String, Object> output) {
        ExecutionContext context = contextService.getContext(executionId);
        if (context == null) return;

        context.getNodeOutputs().put(nodeId, output);

        List<String> returnVars = returnHandler.getReturnVariables(executionId);
        if (returnVars != null && !returnVars.isEmpty()) {
            for (String var : returnVars) {
                if (output.containsKey(var)) {
                    log.info("🎯 Promoting output variable '{}' to global context for return", var);
                    context.getGlobalVariables().put(var, output.get(var));
                }
            }
        }

        contextService.updateContext(executionId, context);
    }

    public void resumeWorkflowAtNode(UUID workflowId, String nodeId, Map<String, Object> payload) {
        try {
            UUID executionId = findActiveExecution(workflowId);
            if (executionId != null) resumeExistingExecution(executionId, nodeId, payload);
            else startWorkflowAtSpecificNode(workflowId, nodeId, payload);
        } catch (Exception e) { throw new RuntimeException("Resume failed", e); }
    }

    private UUID findActiveExecution(UUID workflowId) {
        List<Execution> active = executionRepository.findByWorkflowIdAndStatus(workflowId, "RUNNING");
        return active.isEmpty() ? null : active.get(0).getId();
    }

    private void routeNodeToService(UUID executionId, UUID workflowId, WorkflowNode node) {
        ExecutionContext context = contextService.getContext(executionId);
        sagaCoordinator.getSagaForExecution(executionId).ifPresent(saga ->
                sagaCoordinator.registerStep(saga.getSagaId(), node.getId(), node.getType(), 0, "{}", "saga-compensation")
        );
        NodeExecutionMessage message = NodeExecutionMessage.builder()
                .executionId(executionId).workflowId(workflowId).nodeId(node.getId())
                .nodeType(node.getType()).nodeData(node.getData())
                .context(buildNodeContext(executionId, node.getId(), context))
                .dependencies(getDependencies(executionId, node.getId()))
                .timestamp(Instant.now())
                .googleAccessToken((String) context.getGlobalVariables().get("googleAccessToken"))
                .priority(NodeExecutionMessage.Priority.NORMAL).build();
        eventProducer.publishNodeExecution(message);
    }

    private void initializeExecutionContext(UUID executionId, WorkflowDefinition workflowDef, Map<String, Object> payload) {
        ExecutionContext context = ExecutionContext.builder()
                .executionId(executionId).workflowId(workflowDef.getId())
                .status(ExecutionContext.ExecutionStatus.RUNNING).startTime(Instant.now())
                .globalVariables(new HashMap<>()).nodeOutputs(new HashMap<>()).build();
        if (payload != null) context.getGlobalVariables().putAll(payload);
        context.getGlobalVariables().put("execution_id", executionId.toString());
        context.getGlobalVariables().put("workflow_name", workflowDef.getName());
        contextService.storeContext(executionId, context);
    }

    private Map<String, Object> buildNodeContext(UUID executionId, String nodeId, ExecutionContext context) {
        Map<String, Object> nodeContext = new HashMap<>();
        List<String> dependencies = getDependencies(executionId, nodeId);
        for (String depId : dependencies) {
            Map<String, Object> output = context.getNodeOutputs().get(depId);
            if (output != null) {
                nodeContext.putAll(output);
                nodeContext.put(depId + "_output", output);
            }
        }
        if (context.getGlobalVariables() != null) nodeContext.putAll(context.getGlobalVariables());
        return nodeContext;
    }

    private List<String> getDependencies(UUID executionId, String nodeId) {
        String key = "execution:dependencies:" + executionId;
        DependencyGraph graph = (DependencyGraph) redisTemplate.opsForValue().get(key);
        return (graph != null) ? graph.getIncomingEdges().getOrDefault(nodeId, new ArrayList<>()) : new ArrayList<>();
    }

    private void completeWorkflowExecution(UUID executionId) {
        try {
            Execution execution = executionRepository.findById(executionId).orElseThrow();
            Map<String, Object> finalOutput = returnHandler.extractReturnVariables(executionId);
            executionService.completeExecution(execution, finalOutput);
            log.info("Workflow completed successfully: {}", executionId);
        } catch (Exception e) { log.error("Complete error", e); }
    }

    private void resumeExistingExecution(UUID executionId, String nodeId, Map<String, Object> payload) {
        ExecutionContext context = contextService.getContext(executionId);
        if (payload != null) context.getGlobalVariables().putAll(payload);
        contextService.updateContext(executionId, context);
        Workflows workflow = workflowRepository.findById(context.getWorkflowId()).orElseThrow();
        WorkflowDefinition workflowDef = workflowDefinitionParser.parseWorkflowDefinition(workflow);
        contextService.addReadyNodes(executionId, List.of(nodeId));
        routeNodesToServices(executionId, List.of(nodeId), workflowDef);
    }

    private void startWorkflowAtSpecificNode(UUID workflowId, String nodeId, Map<String, Object> payload) {
        Workflows workflow = workflowRepository.findById(workflowId).orElseThrow();
        Execution execution = executionService.startExecution(workflow);
        initializeExecutionContext(execution.getId(), workflowDefinitionParser.parseWorkflowDefinition(workflow), payload);
        contextService.addReadyNodes(execution.getId(), List.of(nodeId));
        routeNodesToServices(execution.getId(), List.of(nodeId), workflowDefinitionParser.parseWorkflowDefinition(workflow));
    }

    private void routeNodesToServices(UUID executionId, List<String> nodeIds, WorkflowDefinition workflow) {
        Map<String, WorkflowNode> nodeMap = workflow.getNodes().stream().collect(Collectors.toMap(WorkflowNode::getId, Function.identity()));
        for (String nodeId : nodeIds) {
            WorkflowNode node = nodeMap.get(nodeId);
            if (node != null) routeNodeToService(executionId, workflow.getId(), node);
        }
    }
}
package com.marcella.backend.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.marcella.backend.workflow.DependencyGraph;
import com.marcella.backend.workflow.WorkflowDefinition;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class KahnAlgoService {
    private final RedisTemplate<String, Object> redisTemplate;

    public DependencyGraph buildDependencyGraph(WorkflowDefinition workflow) {
        Map<String, List<String>> incomingEdges = new HashMap<>();
        Map<String, List<String>> outgoingEdges = new HashMap<>();
        Map<String, Integer> inDegree = new HashMap<>();
        Map<String, Map<String, String>> edgeHandles = new HashMap<>();

        workflow.getNodes().forEach(node -> {
            incomingEdges.put(node.getId(), new ArrayList<>());
            outgoingEdges.put(node.getId(), new ArrayList<>());
            inDegree.put(node.getId(), 0);
            edgeHandles.put(node.getId(), new HashMap<>());
        });

        workflow.getEdges().forEach(edge -> {
            String source = edge.getSource();
            String target = edge.getTarget();

            outgoingEdges.get(source).add(target);
            incomingEdges.get(target).add(source);
            inDegree.put(target, inDegree.get(target) + 1);

            if (edge.getSourceHandle() != null && !edge.getSourceHandle().isBlank()) {
                edgeHandles.get(source).put(target, edge.getSourceHandle());
            }
        });

        return DependencyGraph.builder()
                .incomingEdges(incomingEdges)
                .outgoingEdges(outgoingEdges)
                .inDegree(inDegree)
                .completedNodes(new HashSet<>())
                .failedNodes(new HashSet<>())
                .edgeHandles(edgeHandles)
                .build();
    }

    public List<String> getInitialReadyNodes(DependencyGraph graph) {
        return graph.getInDegree().entrySet().stream()
                .filter(entry -> entry.getValue() == 0)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Process completion of a node. When the completed node is a condition/filter node
     * (its output contains a "branch" key with value "true" or "false"), only the edges
     * whose sourceHandle matches that value are activated; all other branch descendants
     * are recursively skipped so the workflow can still reach completion.
     *
     * @param output the node's output map – may be null for non-condition nodes
     */
    public List<String> processNodeCompletion(UUID executionId, String completedNodeId,
                                               Map<String, Object> output) {
        String dependencyKey = "execution:dependencies:" + executionId;
        DependencyGraph graph = (DependencyGraph) redisTemplate.opsForValue().get(dependencyKey);

        if (graph == null) {
            throw new IllegalStateException("Dependency graph not found for execution: " + executionId);
        }

        graph.getCompletedNodes().add(completedNodeId);

        // Determine whether this node is a condition/filter node with a resolved branch.
        String conditionBranch = null;
        if (output != null && output.containsKey("branch")) {
            conditionBranch = String.valueOf(output.get("branch")).toLowerCase().trim();
        }

        List<String> newlyReadyNodes = new ArrayList<>();
        List<String> dependentNodes = graph.getOutgoingEdges()
                .getOrDefault(completedNodeId, Collections.emptyList());

        Map<String, String> handles = graph.getEdgeHandles() != null
                ? graph.getEdgeHandles().getOrDefault(completedNodeId, Collections.emptyMap())
                : Collections.emptyMap();

        for (String dependentNode : dependentNodes) {
            String handle = handles.get(dependentNode);
            boolean isWrongBranch = conditionBranch != null
                    && handle != null
                    && !handle.equalsIgnoreCase(conditionBranch);

            if (isWrongBranch) {
                // Skip this node and recursively propagate the skip through its subgraph
                // so that downstream join-nodes still have their in-degrees decremented.
                skipSubgraph(graph, dependentNode, newlyReadyNodes);
                log.info("Skipped branch '{}' node {} (condition branch was '{}')",
                        handle, dependentNode, conditionBranch);
            } else {
                int newDegree = graph.getInDegree().get(dependentNode) - 1;
                graph.getInDegree().put(dependentNode, newDegree);
                if (newDegree == 0) {
                    newlyReadyNodes.add(dependentNode);
                }
            }
        }

        redisTemplate.opsForValue().getAndSet(dependencyKey, graph);
        return newlyReadyNodes;
    }

    /**
     * Mark a node as skipped and propagate the skip through all its descendants,
     * decrementing in-degrees so that nodes which can be reached via other paths
     * are still dispatched correctly.
     */
    private void skipSubgraph(DependencyGraph graph, String nodeId, List<String> newlyReadyNodes) {
        if (graph.getCompletedNodes().contains(nodeId)) {
            return; // already processed (e.g. shared join node reached via another path)
        }
        graph.getCompletedNodes().add(nodeId);

        List<String> children = graph.getOutgoingEdges()
                .getOrDefault(nodeId, Collections.emptyList());
        for (String child : children) {
            int newDegree = graph.getInDegree().get(child) - 1;
            graph.getInDegree().put(child, newDegree);
            if (newDegree == 0 && !graph.getCompletedNodes().contains(child)) {
                // This child is now unblocked — it sits at a join point reached by other
                // (non-skipped) branches, so it should run normally.
                newlyReadyNodes.add(child);
            } else if (newDegree < 0) {
                // Guard against double-decrement if the graph is re-entered
                graph.getInDegree().put(child, 0);
            }
        }
    }

    public boolean isWorkflowComplete(UUID executionId) {
        String dependencyKey = "execution:dependencies:" + executionId;
        DependencyGraph graph = (DependencyGraph) redisTemplate.opsForValue().get(dependencyKey);

        if (graph == null) return false;

        int totalNodes = graph.getInDegree().size();
        int completedNodes = graph.getCompletedNodes().size();
        int failedNodes = graph.getFailedNodes().size();

        return (completedNodes + failedNodes) == totalNodes;
    }
}


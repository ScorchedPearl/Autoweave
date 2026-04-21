package com.marcella.backend.nodeHandlers;

import com.marcella.backend.services.WorkflowEventProducer;
import com.marcella.backend.workflow.NodeCompletionMessage;
import com.marcella.backend.workflow.NodeExecutionMessage;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MongoDbNodeHandler implements NodeHandler {

    private final WorkflowEventProducer eventProducer;

    @Override
    public boolean canHandle(String nodeType) {
        return "mongo-db".equals(nodeType);
    }

    @Override
    public Map<String, Object> execute(NodeExecutionMessage message) {
        long startTime = System.currentTimeMillis();
        Map<String, Object> output = new HashMap<>();

        try {
            Map<String, Object> nodeData = message.getNodeData();
            if (nodeData == null) throw new IllegalArgumentException("Node data is missing");

            String uri = (String) nodeData.getOrDefault("uri", "mongodb://localhost:27017");
            String databaseName = (String) nodeData.getOrDefault("database", "mydb");
            String queryStr = (String) nodeData.getOrDefault("query", "{}");

            // For simplicity, executing arbitrary JSON as a raw command
            // Typically MongoDB requires {"find": "collection", "filter": {}} format for runCommand
            try (MongoClient mongoClient = MongoClients.create(uri)) {
                MongoDatabase database = mongoClient.getDatabase(databaseName);
                Document command = Document.parse(queryStr);
                Document result = database.runCommand(command);
                output.put("result", result);
            }

            output.put("status", "success");
            publishCompletion(message, output, "COMPLETED", System.currentTimeMillis() - startTime);
            return output;

        } catch (Exception e) {
            log.error("MongoDB node execution failed", e);
            output.put("error", e.getMessage());
            publishCompletion(message, output, "FAILED", System.currentTimeMillis() - startTime);
            throw new RuntimeException("MongoDB execution failed", e);
        }
    }

    private void publishCompletion(NodeExecutionMessage message, Map<String, Object> output, String status, long processingTime) {
        NodeCompletionMessage completionMessage = NodeCompletionMessage.builder()
                .executionId(message.getExecutionId())
                .workflowId(message.getWorkflowId())
                .nodeId(message.getNodeId())
                .nodeType(message.getNodeType())
                .status(status)
                .output(output)
                .timestamp(Instant.now())
                .processingTime(processingTime)
                .build();
        eventProducer.publishNodeCompletion(completionMessage);
    }
}

package com.marcella.backend.nodeHandlers;

import com.marcella.backend.services.WorkflowEventProducer;
import com.marcella.backend.workflow.NodeCompletionMessage;
import com.marcella.backend.workflow.NodeExecutionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MysqlNodeHandler implements NodeHandler {

    private final WorkflowEventProducer eventProducer;

    @Override
    public boolean canHandle(String nodeType) {
        return "mysql-db".equals(nodeType);
    }

    @Override
    public Map<String, Object> execute(NodeExecutionMessage message) {
        long startTime = System.currentTimeMillis();
        Map<String, Object> output = new HashMap<>();

        try {
            Map<String, Object> nodeData = message.getNodeData();
            if (nodeData == null) throw new IllegalArgumentException("Node data is missing");

            String host = (String) nodeData.getOrDefault("host", "localhost");
            int port = (int) nodeData.getOrDefault("port", 3306);
            String database = (String) nodeData.getOrDefault("database", "");
            String username = (String) nodeData.getOrDefault("username", "");
            String password = (String) nodeData.getOrDefault("password", "");
            String query = (String) nodeData.getOrDefault("query", "");

            String jdbcUrl = String.format("jdbc:mysql://%s:%d/%s", host, port, database);

            try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password);
                 Statement stmt = conn.createStatement()) {
                
                boolean isResultSet = stmt.execute(query);
                if (isResultSet) {
                    try (ResultSet rs = stmt.getResultSet()) {
                        ResultSetMetaData md = rs.getMetaData();
                        int columns = md.getColumnCount();
                        List<Map<String, Object>> rows = new ArrayList<>();
                        while (rs.next()) {
                            Map<String, Object> row = new HashMap<>();
                            for (int i = 1; i <= columns; ++i) {
                                row.put(md.getColumnName(i), rs.getObject(i));
                            }
                            rows.add(row);
                        }
                        output.put("rows", rows);
                    }
                } else {
                    int updateCount = stmt.getUpdateCount();
                    output.put("update_count", updateCount);
                }
            }

            output.put("status", "success");
            publishCompletion(message, output, "COMPLETED", System.currentTimeMillis() - startTime);
            return output;

        } catch (Exception e) {
            log.error("MySQL node execution failed", e);
            output.put("error", e.getMessage());
            publishCompletion(message, output, "FAILED", System.currentTimeMillis() - startTime);
            throw new RuntimeException("MySQL execution failed", e);
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

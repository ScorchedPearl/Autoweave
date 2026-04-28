package com.marcella.backend.nodeHandlers;

import com.marcella.backend.services.WorkflowEventProducer;
import com.marcella.backend.workflow.NodeCompletionMessage;
import com.marcella.backend.workflow.NodeExecutionMessage;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DbHealthCheckNodeHandler implements NodeHandler {

    private final WorkflowEventProducer eventProducer;

    @Override
    public boolean canHandle(String nodeType) {
        return "db-health-check".equals(nodeType);
    }

    @Override
    public Map<String, Object> execute(NodeExecutionMessage message) {
        long startTime = System.currentTimeMillis();
        Map<String, Object> output = new HashMap<>();

        try {
            Map<String, Object> nodeData = message.getNodeData();
            if (nodeData == null) throw new IllegalArgumentException("Node data is missing");

            String dbType = ((String) nodeData.getOrDefault("db_type", "postgres")).toLowerCase();
            String host = (String) nodeData.getOrDefault("host", "localhost");
            Object portObj = nodeData.get("port");
            String database = (String) nodeData.getOrDefault("database", "");
            String username = (String) nodeData.getOrDefault("username", "");
            String password = (String) nodeData.getOrDefault("password", "");

            long checkStart = System.currentTimeMillis();
            Map<String, Object> checkResult = switch (dbType) {
                case "postgres" -> checkPostgres(host, portObj != null ? toInt(portObj, 5432) : 5432, database, username, password);
                case "mysql"    -> checkMysql(host, portObj != null ? toInt(portObj, 3306) : 3306, database, username, password);
                case "mongo"    -> checkMongo(host, portObj != null ? toInt(portObj, 27017) : 27017, username, password);
                default -> throw new IllegalArgumentException("Unsupported db_type: " + dbType + ". Use postgres, mysql, or mongo.");
            };
            long latencyMs = System.currentTimeMillis() - checkStart;

            output.put("status", "healthy");
            output.put("db_type", dbType);
            output.put("host", host);
            output.put("port", portObj != null ? portObj : checkResult.get("default_port"));
            output.put("latency_ms", latencyMs);
            output.put("server_version", checkResult.getOrDefault("server_version", ""));
            output.put("message", checkResult.getOrDefault("message", "Connection successful"));

            publishCompletion(message, output, "COMPLETED", System.currentTimeMillis() - startTime);
            return output;

        } catch (Exception e) {
            log.error("DB health check failed", e);
            output.put("status", "unhealthy");
            output.put("error", e.getMessage());
            publishCompletion(message, output, "FAILED", System.currentTimeMillis() - startTime);
            throw new RuntimeException("DB health check failed", e);
        }
    }

    private Map<String, Object> checkPostgres(String host, int port, String database, String username, String password) throws Exception {
        String db = database.isBlank() ? "postgres" : database;
        String url = String.format("jdbc:postgresql://%s:%d/%s", host, port, db);
        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT version()")) {
            String version = rs.next() ? rs.getString(1) : "";
            return Map.of("server_version", version, "default_port", 5432, "message", "SELECT version() OK");
        }
    }

    private Map<String, Object> checkMysql(String host, int port, String database, String username, String password) throws Exception {
        String db = database.isBlank() ? "" : "/" + database;
        String url = String.format("jdbc:mysql://%s:%d%s", host, port, db);
        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT VERSION()")) {
            String version = rs.next() ? rs.getString(1) : "";
            return Map.of("server_version", version, "default_port", 3306, "message", "SELECT VERSION() OK");
        }
    }

    private Map<String, Object> checkMongo(String host, int port, String username, String password) {
        String uri = (username != null && !username.isBlank())
                ? String.format("mongodb://%s:%s@%s:%d", username, password, host, port)
                : String.format("mongodb://%s:%d", host, port);

        try (MongoClient client = MongoClients.create(uri)) {
            Document result = client.getDatabase("admin").runCommand(new Document("ping", 1));
            Document buildInfo = client.getDatabase("admin").runCommand(new Document("buildInfo", 1));
            String version = buildInfo.getString("version");
            return Map.of("server_version", version != null ? version : "", "default_port", 27017, "message", "ping OK: " + result.toJson());
        }
    }

    private int toInt(Object val, int fallback) {
        if (val instanceof Number n) return n.intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return fallback; }
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

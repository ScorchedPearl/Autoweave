package com.marcella.backend.nodeHandlers;

import com.marcella.backend.services.WorkflowEventProducer;
import com.marcella.backend.workflow.NodeCompletionMessage;
import com.marcella.backend.workflow.NodeExecutionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ClaudeAuthNodeHandler implements NodeHandler {

    private final WorkflowEventProducer eventProducer;
    private final RedisTemplate<String, String> redisTemplate;
    private static final Duration API_KEY_TTL = Duration.ofHours(1);

    public ClaudeAuthNodeHandler(WorkflowEventProducer eventProducer, 
                                 @Qualifier("customStringRedisTemplate") RedisTemplate<String, String> redisTemplate) {
        this.eventProducer = eventProducer;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean canHandle(String nodeType) {
        return "claude-auth".equals(nodeType);
    }

    @Override
    public Map<String, Object> execute(NodeExecutionMessage message) {
        long startTime = System.currentTimeMillis();
        String executionId = message.getExecutionId().toString();
        log.info("Executing Claude Auth node: {} for execution: {}", message.getNodeId(), executionId);

        try {
            Map<String, Object> output = new HashMap<>();
            String apiKey = null;

            if (message.getNodeData() != null && message.getNodeData().containsKey("api_key")) {
                apiKey = (String) message.getNodeData().get("api_key");
            }

            if (apiKey != null && !apiKey.trim().isEmpty()) {
                String redisKey = "execution:" + executionId + ":claude_api_key";
                redisTemplate.opsForValue().set(redisKey, apiKey, API_KEY_TTL);
                redisTemplate.opsForValue().set("claude_api_key", apiKey, API_KEY_TTL);
                log.info("✅ Stored Claude API key in Redis for execution: {}", executionId);
                output.put("claude_auth", "success");
            } else {
                log.warn("⚠️ Claude auth node missing 'api_key' in nodeData");
                output.put("claude_auth", "failed - missing key");
            }

            output.put("node_executed_at", Instant.now().toString());
            publishCompletionEvent(message, output, "COMPLETED", System.currentTimeMillis() - startTime);

            return output;

        } catch (Exception e) {
            log.error("❌ Claude Auth node failed: {}", message.getNodeId(), e);
            publishCompletionEvent(message, Map.of("error", e.getMessage()), "FAILED", System.currentTimeMillis() - startTime);
            throw e;
        }
    }

    private void publishCompletionEvent(NodeExecutionMessage message, Map<String, Object> output, String status, long processingTime) {
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

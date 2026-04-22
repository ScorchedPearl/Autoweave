package com.marcella.backend.services;

import com.marcella.backend.workflow.ExecutionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReturnHandlerService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ExecutionContextService contextService;

    private static final String RETURN_VARIABLES_KEY = "execution:return_vars:";
    private static final Duration DEFAULT_EXPIRATION = Duration.ofHours(24);

    public void storeReturnVariables(UUID executionId, List<String> returnVariables) {
        if (returnVariables == null || returnVariables.isEmpty()) return;
        String key = RETURN_VARIABLES_KEY + executionId;
        redisTemplate.opsForList().rightPushAll(key, returnVariables.toArray());
        redisTemplate.expire(key, DEFAULT_EXPIRATION);
    }

    public List<String> getReturnVariables(UUID executionId) {
        String key = RETURN_VARIABLES_KEY + executionId;
        List<Object> variables = redisTemplate.opsForList().range(key, 0, -1);
        return (variables == null) ? new ArrayList<>() : variables.stream().map(Object::toString).toList();
    }

    public Map<String, Object> extractReturnVariables(UUID executionId) {
        List<String> requestedVariables = getReturnVariables(executionId);
        if (requestedVariables.isEmpty()) return new HashMap<>();

        ExecutionContext context = contextService.getContext(executionId);
        if (context == null) return new HashMap<>();

        Map<String, Object> allVariables = new HashMap<>();

        if (context.getGlobalVariables() != null) {
            allVariables.putAll(context.getGlobalVariables());
        }

        if (context.getNodeOutputs() != null) {
            for (Map.Entry<String, Map<String, Object>> nodeEntry : context.getNodeOutputs().entrySet()) {
                if (nodeEntry.getValue() != null) {
                    allVariables.putAll(nodeEntry.getValue());
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        for (String varName : requestedVariables) {
            if (allVariables.containsKey(varName)) {
                result.put(varName, allVariables.get(varName));
            } else {
                result.put(varName, null);
                log.warn("❌ Return variable '{}' not found for execution {}", varName, executionId);
            }
        }
        return result;
    }

    public void clearReturnVariables(UUID executionId) {
        redisTemplate.delete(RETURN_VARIABLES_KEY + executionId);
    }

    public Map<String, Object> createReturnPayload(UUID executionId, String status) {
        Map<String, Object> returnVariables = extractReturnVariables(executionId);
        List<String> requestedVariables = getReturnVariables(executionId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("executionId", executionId);
        payload.put("status", status);
        payload.put("variables", returnVariables);
        payload.put("requestedVariables", requestedVariables);
        payload.put("timestamp", Instant.now().toString());

        return payload;
    }
}
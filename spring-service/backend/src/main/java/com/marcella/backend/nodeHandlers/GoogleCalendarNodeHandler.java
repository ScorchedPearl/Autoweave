package com.marcella.backend.nodeHandlers;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.marcella.backend.configurations.GoogleCalendarConfig;
import com.marcella.backend.services.WorkflowEventProducer;
import com.marcella.backend.utils.TemplateUtils;
import com.marcella.backend.workflow.NodeCompletionMessage;
import com.marcella.backend.workflow.NodeExecutionMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarNodeHandler implements NodeHandler {

    private final WorkflowEventProducer eventProducer;

    @Override
    public boolean canHandle(String nodeType) {
        return "googleCalendar".equalsIgnoreCase(nodeType);
    }

    @Override
    public Map<String, Object> execute(NodeExecutionMessage message) {
        long startTimeMillis = System.currentTimeMillis();
        Map<String, Object> output = new HashMap<>();

        try {
            Map<String, Object> context = message.getContext();
            Map<String, Object> data = message.getNodeData();

            String googleToken = (String) context.get("googleAccessToken");
            if (googleToken == null || googleToken.isBlank()) {
                throw new IllegalStateException("Missing Google access token");
            }

            String summary = TemplateUtils.substitute((String) data.get("summary"), context);
            String description = data.get("description") != null ? TemplateUtils.substitute((String) data.get("description"), context) : null;
            String location = data.get("location") != null ? TemplateUtils.substitute((String) data.get("location"), context) : null;
            String isoStartTime = convertToISO8601UTC(TemplateUtils.substitute((String) data.get("startTime"), context));
            String isoEndTime = convertToISO8601UTC(TemplateUtils.substitute((String) data.get("endTime"), context));
            String calendarId = TemplateUtils.substitute((String) data.getOrDefault("calendarId", "primary"), context);

            if (summary == null || summary.isBlank()) throw new IllegalArgumentException("Event summary is required");

            Calendar service = GoogleCalendarConfig.getCalendarService(googleToken);

            Event event = new Event()
                    .setSummary(summary)
                    .setStart(new EventDateTime().setDateTime(new DateTime(isoStartTime)))
                    .setEnd(new EventDateTime().setDateTime(new DateTime(isoEndTime)));

            if (description != null && !description.isBlank()) event.setDescription(description);
            if (location != null && !location.isBlank()) event.setLocation(location);

            Object attendeesObj = data.get("attendees");
            if (attendeesObj != null) {
                String attendeesStr = TemplateUtils.substitute(String.valueOf(attendeesObj), context);
                if (!attendeesStr.isBlank()) {
                    List<EventAttendee> attendees = Arrays.stream(attendeesStr.split(","))
                            .map(String::trim)
                            .filter(email -> !email.isEmpty())
                            .map(email -> new EventAttendee().setEmail(email))
                            .collect(Collectors.toList());

                    event.setAttendees(attendees);
                    log.info("Added {} attendees to event", attendees.size());
                }
            }

            log.info("Creating calendar event: {} and sending invitations to attendees", summary);
            Event createdEvent = service.events().insert(calendarId, event)
                    .setSendUpdates("all")
                    .execute();

            if (context != null) output.putAll(context);
            output.put("calendar_event_id", createdEvent.getId());
            output.put("calendar_event_link", createdEvent.getHtmlLink());
            output.put("event_created", true);
            output.put("node_type", "googleCalendar");
            output.put("executed_at", Instant.now().toString());

            publishCompletionEvent(message, output, "COMPLETED", System.currentTimeMillis() - startTimeMillis);
            log.info("Successfully created event: {} with ID: {}", summary, createdEvent.getId());
            return output;

        } catch (Exception e) {
            log.error("Google Calendar Node Error for node: {}", message.getNodeId(), e);
            throw new RuntimeException("Google Calendar Node failed: " + e.getMessage(), e);
        }
    }

    private String convertToISO8601UTC(String input) throws Exception {
        if (input == null || input.isBlank()) return null;
        SimpleDateFormat inputFormat = new SimpleDateFormat("dd MMMM yyyy, h:mm a", Locale.ENGLISH);
        inputFormat.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));

        Date date = inputFormat.parse(input);

        SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        return isoFormat.format(date);
    }

    private void publishCompletionEvent(NodeExecutionMessage message, Map<String, Object> output, String status, long duration) {
        NodeCompletionMessage completion = NodeCompletionMessage.builder()
                .executionId(message.getExecutionId())
                .workflowId(message.getWorkflowId())
                .nodeId(message.getNodeId())
                .nodeType(message.getNodeType())
                .status(status)
                .output(output)
                .timestamp(Instant.now())
                .processingTime(duration)
                .build();

        eventProducer.publishNodeCompletion(completion);
    }
}
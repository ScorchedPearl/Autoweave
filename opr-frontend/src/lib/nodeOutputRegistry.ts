export interface NodeOutputVar {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array";
}

export const NODE_OUTPUT_REGISTRY: Record<string, NodeOutputVar[]> = {
  "text-generation": [
    { key: "generated_text",    label: "Generated Text",   type: "string"  },
    { key: "original_prompt",   label: "Original Prompt",  type: "string"  },
    { key: "model_used",        label: "Model Used",       type: "string"  },
    { key: "node_executed_at",  label: "Executed At",      type: "string"  },
  ],
  "ai-decision": [
    { key: "decision",          label: "Decision",         type: "string"  },
    { key: "confidence",        label: "Confidence",       type: "number"  },
    { key: "reasoning",         label: "Reasoning",        type: "string"  },
    { key: "threshold_met",     label: "Threshold Met",    type: "boolean" },
    { key: "options_considered",label: "Options",          type: "array"   },
  ],
  "summarization": [
    { key: "summary",           label: "Summary",          type: "string"  },
    { key: "original_text",     label: "Original Text",    type: "string"  },
    { key: "model_used",        label: "Model Used",       type: "string"  },
  ],
  "text-classification": [
    { key: "classification",    label: "Classification",   type: "string"  },
    { key: "confidence",        label: "Confidence",       type: "number"  },
    { key: "categories",        label: "Categories",       type: "array"   },
    { key: "text",              label: "Input Text",       type: "string"  },
  ],
  "translation": [
    { key: "translated_text",   label: "Translated Text",  type: "string"  },
    { key: "original_text",     label: "Original Text",    type: "string"  },
    { key: "source_language",   label: "Source Language",  type: "string"  },
    { key: "target_language",   label: "Target Language",  type: "string"  },
  ],
  "content-generation": [
    { key: "generated_content", label: "Generated Content",type: "string"  },
    { key: "topic",             label: "Topic",            type: "string"  },
    { key: "content_type",      label: "Content Type",     type: "string"  },
    { key: "word_count",        label: "Word Count",       type: "number"  },
  ],
  "named-entity": [
    { key: "entities",          label: "Entities",         type: "array"   },
    { key: "entity_types",      label: "Entity Types",     type: "array"   },
    { key: "num_entities",      label: "Entity Count",     type: "number"  },
    { key: "text",              label: "Input Text",       type: "string"  },
  ],
  "question-answer": [
    { key: "answer",            label: "Answer",           type: "string"  },
    { key: "question",          label: "Question",         type: "string"  },
    { key: "context_text",      label: "Context",          type: "string"  },
  ],
  "search-agent": [
    { key: "answer",            label: "Answer",           type: "string"  },
    { key: "query",             label: "Query",            type: "string"  },
    { key: "search_results",    label: "Search Results",   type: "array"   },
    { key: "sources_used",      label: "Sources Used",     type: "number"  },
  ],
  "data-analyst-agent": [
    { key: "analysis_result",   label: "Analysis Result",  type: "object"  },
    { key: "insight",           label: "Insight",          type: "string"  },
    { key: "visualization",     label: "Visualization",    type: "string"  },
  ],
  "start": [
    { key: "node_executed_at",  label: "Started At",       type: "string"  },
    { key: "execution_id",      label: "Execution ID",     type: "string"  },
  ],
  "trigger": [
    { key: "webhook_payload",   label: "Webhook Payload",  type: "object"  },
    { key: "webhook_method",    label: "HTTP Method",      type: "string"  },
    { key: "triggered_at",      label: "Triggered At",     type: "string"  },
  ],
  "condition": [
    { key: "condition_result",  label: "Condition Result", type: "boolean" },
    { key: "branch",            label: "Branch Taken",     type: "string"  },
    { key: "evaluation_details",label: "Eval Details",     type: "object"  },
  ],
  "delay": [
    { key: "delay_completed",   label: "Completed",        type: "boolean" },
    { key: "duration_ms",       label: "Duration (ms)",    type: "number"  },
    { key: "completed_at",      label: "Completed At",     type: "string"  },
  ],
  "httpGet": [
    { key: "http_status_code",     label: "Status Code",   type: "number"  },
    { key: "http_response_body",   label: "Response Body", type: "string"  },
    { key: "http_response_json",   label: "Response JSON", type: "object"  },
    { key: "http_request_successful", label: "Success",    type: "boolean" },
  ],
  "httpPost": [
    { key: "http_status_code",     label: "Status Code",   type: "number"  },
    { key: "http_response_body",   label: "Response Body", type: "string"  },
    { key: "http_response_json",   label: "Response JSON", type: "object"  },
    { key: "http_request_successful", label: "Success",    type: "boolean" },
  ],
  "httpPut": [
    { key: "http_status_code",     label: "Status Code",   type: "number"  },
    { key: "http_response_json",   label: "Response JSON", type: "object"  },
    { key: "http_request_successful", label: "Success",    type: "boolean" },
  ],
  "httpDelete": [
    { key: "http_status_code",     label: "Status Code",   type: "number"  },
    { key: "http_request_successful", label: "Success",    type: "boolean" },
  ],
  "calculator": [
    { key: "result",              label: "Result",          type: "number"  },
    { key: "expression",          label: "Expression",      type: "string"  },
    { key: "calculation_successful", label: "Success",      type: "boolean" },
  ],
  "currentTime": [
    { key: "current_time",        label: "Current Time",    type: "string"  },
    { key: "time_zone",           label: "Time Zone",       type: "string"  },
  ],
  "googleCalendar": [
    { key: "calendar_event_id",      label: "Event ID",     type: "string"  },
    { key: "calendar_event_summary", label: "Event Title",  type: "string"  },
    { key: "calendar_event_link",    label: "Event Link",   type: "string"  },
    { key: "calendar_event_start",   label: "Start Time",   type: "string"  },
    { key: "calendar_event_end",     label: "End Time",     type: "string"  },
    { key: "event_created",          label: "Created",      type: "boolean" },
  ],
  "gmailSend": [
    { key: "gmail_message_id",   label: "Message ID",       type: "string"  },
    { key: "gmail_sent",         label: "Sent",             type: "boolean" },
    { key: "gmail_to",           label: "Recipient",        type: "string"  },
    { key: "gmail_subject",      label: "Subject",          type: "string"  },
    { key: "sent_at",            label: "Sent At",          type: "string"  },
  ],
  "gmailSearch": [
    { key: "gmail_messages",      label: "Messages",        type: "array"   },
    { key: "gmail_message_count", label: "Message Count",   type: "number"  },
    { key: "gmail_query",         label: "Query",           type: "string"  },
    { key: "search_successful",   label: "Success",         type: "boolean" },
  ],
  "gmailMarkRead": [
    { key: "gmail_messages_modified", label: "Modified Count", type: "number"  },
    { key: "gmail_marked_as_read",    label: "Marked Read",    type: "boolean" },
    { key: "modification_successful", label: "Success",        type: "boolean" },
  ],
  "gmailAddLabel": [
    { key: "gmail_messages_modified",    label: "Modified Count", type: "number" },
    { key: "gmail_labels_added",         label: "Labels Added",   type: "array"  },
    { key: "label_modification_successful", label: "Success",     type: "boolean"},
  ],
  "gmailCreateDraft": [
    { key: "gmail_draft_id",      label: "Draft ID",        type: "string"  },
    { key: "gmail_draft_subject", label: "Subject",         type: "string"  },
    { key: "gmail_draft_to",      label: "Recipient",       type: "string"  },
    { key: "draft_creation_successful", label: "Success",   type: "boolean" },
  ],
  "gmailReply": [
    { key: "gmail_reply_message_id",  label: "Reply ID",    type: "string"  },
    { key: "gmail_reply_thread_id",   label: "Thread ID",   type: "string"  },
    { key: "reply_successful",        label: "Success",     type: "boolean" },
  ],
  "action": [
    { key: "email_sent",   label: "Email Sent", type: "boolean" },
    { key: "recipient",    label: "Recipient",  type: "string"  },
    { key: "subject",      label: "Subject",    type: "string"  },
    { key: "sent_at",      label: "Sent At",    type: "string"  },
  ],
  "transform": [
    { key: "node_executed_at", label: "Transformed At", type: "string" },
  ],

  /* ─── Auth Nodes ──────────────────────────────────────────── */
  "gemini-auth": [
    { key: "gemini_auth",      label: "Auth Status",   type: "string" },
    { key: "node_executed_at", label: "Executed At",   type: "string" },
  ],
  "openai-auth": [
    { key: "openai_auth",      label: "Auth Status",   type: "string" },
    { key: "node_executed_at", label: "Executed At",   type: "string" },
  ],
  "claude-auth": [
    { key: "claude_auth",      label: "Auth Status",   type: "string" },
    { key: "node_executed_at", label: "Executed At",   type: "string" },
  ],

  /* ─── Competitive Programming Nodes ──────────────────────── */
  "cp-solver": [
    { key: "code",             label: "Generated Code",   type: "string" },
    { key: "problem",          label: "Problem",          type: "string" },
    { key: "node_executed_at", label: "Executed At",      type: "string" },
  ],
  "cp-testgen": [
    { key: "testcases",        label: "Test Cases",       type: "array"  },
    { key: "problem",          label: "Problem",          type: "string" },
    { key: "num_tests",        label: "Num Tests",        type: "number" },
  ],
  "cp-executor": [
    { key: "test_results",     label: "Test Results",     type: "array"  },
    { key: "all_passed",       label: "All Passed",       type: "boolean"},
    { key: "passed_count",     label: "Passed Count",     type: "number" },
    { key: "total_tests",      label: "Total Tests",      type: "number" },
  ],
  "cp-agent": [
    { key: "final_code",       label: "Final Code",       type: "string" },
    { key: "all_passed",       label: "All Passed",       type: "boolean"},
    { key: "test_results",     label: "Test Results",     type: "array"  },
    { key: "problem",          label: "Problem",          type: "string" },
  ],

  /* ─── Database Nodes ──────────────────────────────────────── */
  "postgres-db": [
    { key: "rows",             label: "Result Rows",      type: "array"  },
    { key: "update_count",     label: "Rows Affected",    type: "number" },
    { key: "status",           label: "Status",           type: "string" },
  ],
  "mysql-db": [
    { key: "rows",             label: "Result Rows",      type: "array"  },
    { key: "update_count",     label: "Rows Affected",    type: "number" },
    { key: "status",           label: "Status",           type: "string" },
  ],
  "mongo-db": [
    { key: "documents",        label: "Documents",        type: "array"  },
    { key: "matched_count",    label: "Matched Count",    type: "number" },
    { key: "modified_count",   label: "Modified Count",   type: "number" },
    { key: "status",           label: "Status",           type: "string" },
  ],
};

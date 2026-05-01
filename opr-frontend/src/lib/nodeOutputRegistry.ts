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
  "k-means": [
    { key: "cluster_labels", label: "Cluster Labels", type: "array" },
    { key: "centroids", label: "Centroids", type: "array" },
    { key: "inertia", label: "Inertia", type: "number" },
    { key: "n_clusters", label: "Number of Clusters", type: "number" },
    { key: "n_samples", label: "Total Samples", type: "number" },
  ],
  "clusterization": [
    { key: "cluster_labels", label: "Cluster Labels", type: "array" },
    { key: "n_clusters_found", label: "Clusters Found", type: "number" },
    { key: "noise_points", label: "Noise Points", type: "number" },
    { key: "algorithm_used", label: "Algorithm Used", type: "string" },
    { key: "inertia", label: "Inertia", type: "number" },
    { key: "n_samples", label: "Total Samples", type: "number" },
  ],
  "linear-regression": [
    { key: "coefficients", label: "Coefficients", type: "array" },
    { key: "intercept", label: "Intercept", type: "number" },
    { key: "r2_score", label: "R2 Score", type: "number" },
    { key: "n_train_samples", label: "Train Samples", type: "number" },
    { key: "predictions", label: "Predictions", type: "array" },
    { key: "n_predictions", label: "Prediction Count", type: "number" },
  ],
  "anomaly-detection": [
    { key: "anomaly_labels", label: "Anomaly Labels", type: "array" },
    { key: "anomaly_scores", label: "Anomaly Scores", type: "array" },
    { key: "anomaly_count", label: "Anomaly Count", type: "number" },
    { key: "anomaly_indices", label: "Anomaly Indices", type: "array" },
    { key: "normal_count", label: "Normal Count", type: "number" },
    { key: "n_samples", label: "Total Samples", type: "number" },
    { key: "contamination", label: "Contamination Rate", type: "number" },
  ],
  "text-embedding": [
    { key: "embeddings", label: "Embeddings", type: "array" },
    { key: "dimensions", label: "Dimensions", type: "number" },
    { key: "text_count", label: "Text Count", type: "number" },
    { key: "model", label: "Model", type: "string" },
  ],
  "python-task": [
    { key: "result",          label: "Result",        type: "object"  },
    { key: "stdout",          label: "Stdout",        type: "string"  },
    { key: "exit_code",       label: "Exit Code",     type: "number"  },
    { key: "node_executed_at",label: "Executed At",   type: "string"  },
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
    { key: "language",         label: "Language",         type: "string" },
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
    { key: "language",         label: "Language",         type: "string" },
  ],
  "cp-agent": [
    { key: "final_code",       label: "Final Code",       type: "string" },
    { key: "language",         label: "Language",         type: "string" },
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
  /* ─── Security Nodes ─────────────────────────────────────────── */
  "ssl-cert-checker": [
    { key: "hostname",          label: "Hostname",           type: "string"  },
    { key: "is_valid",          label: "Is Valid",           type: "boolean" },
    { key: "days_until_expiry", label: "Days Until Expiry",  type: "number"  },
    { key: "expiry_date",       label: "Expiry Date",        type: "string"  },
    { key: "issued_date",       label: "Issued Date",        type: "string"  },
    { key: "subject_cn",        label: "Subject CN",         type: "string"  },
    { key: "issuer_cn",         label: "Issuer CN",          type: "string"  },
    { key: "issuer_org",        label: "Issuer Org",         type: "string"  },
    { key: "san_list",          label: "SANs",               type: "array"   },
    { key: "serial_number",     label: "Serial Number",      type: "string"  },
    { key: "port",              label: "Port",               type: "number"  },
  ],
  "port-scanner": [
    { key: "host",         label: "Host",          type: "string"  },
    { key: "open_ports",   label: "Open Ports",    type: "array"   },
    { key: "closed_ports", label: "Closed Ports",  type: "array"   },
    { key: "open_count",   label: "Open Count",    type: "number"  },
    { key: "total_scanned",label: "Total Scanned", type: "number"  },
    { key: "scan_summary", label: "Scan Summary",  type: "string"  },
  ],
  "get-my-ip": [
    { key: "public_ip", label: "Public IP",  type: "string" },
    { key: "country",   label: "Country",    type: "string" },
    { key: "region",    label: "Region",     type: "string" },
    { key: "city",      label: "City",       type: "string" },
    { key: "org",       label: "ISP / Org",  type: "string" },
    { key: "timezone",  label: "Timezone",   type: "string" },
    { key: "loc",       label: "Coordinates",type: "string" },
  ],
  "hash-generator": [
    { key: "hash",                label: "Hash",                type: "string"  },
    { key: "algorithm",           label: "Algorithm",           type: "string"  },
    { key: "hash_type",           label: "Hash Type",           type: "string"  },
    { key: "output_format",       label: "Output Format",       type: "string"  },
    { key: "input_length",        label: "Input Length (bytes)",type: "number"  },
    { key: "digest_length_bytes", label: "Digest Length (bytes)",type: "number" },
  ],
  "file-integrity-check": [
    { key: "actual_hash",    label: "Actual Hash",     type: "string"  },
    { key: "expected_hash",  label: "Expected Hash",   type: "string"  },
    { key: "algorithm",      label: "Algorithm",       type: "string"  },
    { key: "tampered",       label: "Tampered",        type: "boolean" },
    { key: "match_result",   label: "Match Result",    type: "string"  },
    { key: "label",          label: "Label",           type: "string"  },
    { key: "content_length_bytes", label: "Content Size (bytes)", type: "number" },
  ],
  "password-brute-force": [
    { key: "found",           label: "Credential Found", type: "boolean" },
    { key: "found_password",  label: "Found Password",   type: "string"  },
    { key: "username",        label: "Username",         type: "string"  },
    { key: "attempts_made",   label: "Attempts Made",    type: "number"  },
    { key: "total_wordlist",  label: "Wordlist Size",    type: "number"  },
    { key: "attempts_detail", label: "Attempt Details",  type: "array"   },
    { key: "target_url",      label: "Target URL",       type: "string"  },
  ],
  "sql-injection-scanner": [
    { key: "is_vulnerable",        label: "Is Vulnerable",       type: "boolean" },
    { key: "vulnerability_count",  label: "Vulnerabilities Found",type: "number" },
    { key: "vulnerable_payloads",  label: "Vulnerable Payloads", type: "array"   },
    { key: "total_payloads_tested",label: "Payloads Tested",     type: "number"  },
    { key: "target_url",           label: "Target URL",          type: "string"  },
    { key: "parameter",            label: "Parameter",           type: "string"  },
    { key: "baseline_status",      label: "Baseline Status",     type: "number"  },
    { key: "baseline_length",      label: "Baseline Length",     type: "number"  },
    { key: "scan_results",         label: "Scan Results",        type: "array"   },
  ],

  "db-health-check": [
    { key: "status",           label: "Status",           type: "string" },
    { key: "latency_ms",       label: "Latency (ms)",     type: "number" },
    { key: "db_type",          label: "DB Type",          type: "string" },
    { key: "host",             label: "Host",             type: "string" },
    { key: "port",             label: "Port",             type: "number" },
    { key: "server_version",   label: "Server Version",   type: "string" },
    { key: "message",          label: "Message",          type: "string" },
    { key: "error",            label: "Error",            type: "string" },
  ],
};

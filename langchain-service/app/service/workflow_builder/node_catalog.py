"""
Static catalog of every node type.

Each entry:
  label          – display name shown in the canvas
  category       – grouping label
  icon           – emoji used in the canvas node
  embedding_text – rich keyword string fed to sentence-transformers for Qdrant indexing
  default_config – sensible defaults pre-filled into the node (can be overridden by param_rules)
  output_key     – the main output variable key this node produces (used to wire into next node)
  input_key      – the config field that accepts an upstream {{variable}} reference (None = no wiring)
  param_rules    – list of (regex_pattern, field_name, group_index) tuples;
                   group_index=0 means the full match, 1 means first capture group
"""

from typing import Any, Dict, List, Optional, Tuple

NodeEntry = Dict[str, Any]


ParamRule = Tuple[str, str, int]

NODE_CATALOG: Dict[str, NodeEntry] = {

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    "start": {
        "label": "Start",
        "category": "Triggers",
        "icon": "🚀",
        "embedding_text": (
            "start begin workflow entry point initialize seed context kick off launch"
        ),
        "default_config": {},
        "output_key": "execution_id",
        "input_key": None,
        "param_rules": [],
    },
    "trigger": {
        "label": "Webhook Trigger",
        "category": "Triggers",
        "icon": "🔗",
        "embedding_text": (
            "webhook trigger http receive incoming request endpoint listen call inbound"
        ),
        "default_config": {"method": "POST"},
        "output_key": "webhook_payload",
        "input_key": None,
        "param_rules": [
            (r"\b(GET|POST|PUT|DELETE)\b", "method", 1),
        ],
    },
    "condition": {
        "label": "Condition",
        "category": "Logic",
        "icon": "🔀",
        "embedding_text": (
            "condition if else branch route check compare evaluate logic gate decision split true false"
        ),
        "default_config": {
            "condition.operator": "==",
            "condition.field": "",
            "condition.value": "",
        },
        "output_key": "branch",
        "input_key": None,
        "param_rules": [],
    },
    "delay": {
        "label": "Delay",
        "category": "Logic",
        "icon": "⏱️",
        "embedding_text": (
            "delay wait pause sleep timer hold milliseconds seconds throttle"
        ),
        "default_config": {"duration": 1000, "message": "Delay completed"},
        "output_key": "delay_completed",
        "input_key": None,
        "param_rules": [
            (r"(\d+)\s*(?:ms|milliseconds?)", "duration", 1),
            (r"(\d+)\s*seconds?", "duration", 1),
        ],
    },
    "transform": {
        "label": "Transform",
        "category": "Logic",
        "icon": "🔄",
        "embedding_text": (
            "transform map rename copy remap reshape field key value data convert"
        ),
        "default_config": {"mapping": {}},
        "output_key": "node_executed_at",
        "input_key": None,
        "param_rules": [],
    },

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    "httpGet": {
        "label": "HTTP GET",
        "category": "HTTP",
        "icon": "🌐",
        "embedding_text": (
            "http get request fetch api call retrieve data url endpoint rest web"
        ),
        "default_config": {"url": "", "headers": ""},
        "output_key": "http_response_body",
        "input_key": "url",
        "param_rules": [
            (r"https?://\S+", "url", 0),
        ],
    },
    "httpPost": {
        "label": "HTTP POST",
        "category": "HTTP",
        "icon": "📤",
        "embedding_text": (
            "http post request send submit api call endpoint rest body json payload"
        ),
        "default_config": {"url": "", "body": "", "headers": ""},
        "output_key": "http_response_body",
        "input_key": "url",
        "param_rules": [
            (r"https?://\S+", "url", 0),
        ],
    },
    "httpPut": {
        "label": "HTTP PUT",
        "category": "HTTP",
        "icon": "✏️",
        "embedding_text": (
            "http put update replace patch resource api endpoint rest"
        ),
        "default_config": {"url": "", "body": "", "headers": ""},
        "output_key": "http_response_json",
        "input_key": "url",
        "param_rules": [
            (r"https?://\S+", "url", 0),
        ],
    },
    "httpDelete": {
        "label": "HTTP DELETE",
        "category": "HTTP",
        "icon": "🗑️",
        "embedding_text": (
            "http delete remove destroy resource api endpoint rest"
        ),
        "default_config": {"url": "", "headers": ""},
        "output_key": "http_request_successful",
        "input_key": "url",
        "param_rules": [
            (r"https?://\S+", "url", 0),
        ],
    },

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    "calculator": {
        "label": "Calculator",
        "category": "Utilities",
        "icon": "🧮",
        "embedding_text": (
            "calculator math expression arithmetic calculate compute formula add subtract multiply divide"
        ),
        "default_config": {"expression": ""},
        "output_key": "result",
        "input_key": "expression",
        "param_rules": [],
    },
    "currentTime": {
        "label": "Current Time",
        "category": "Utilities",
        "icon": "🕐",
        "embedding_text": (
            "current time date now timestamp timezone clock utc gmt ist"
        ),
        "default_config": {"timeZone": "UTC"},
        "output_key": "current_time",
        "input_key": None,
        "param_rules": [
            (r"\b(UTC|GMT|America/New_York|America/Los_Angeles|Europe/London|Europe/Paris|Asia/Kolkata|Asia/Tokyo|Asia/Shanghai|Australia/Sydney)\b", "timeZone", 1),
        ],
    },
    "action": {
        "label": "Send Email",
        "category": "Utilities",
        "icon": "📧",
        "embedding_text": (
            "send email notification action sendgrid message alert transactional smtp"
        ),
        "default_config": {"to": "", "subject": "Workflow Result", "body": "{{text}}"},
        "output_key": "email_sent",
        "input_key": "body",
        "param_rules": [
            (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "to", 0),
        ],
    },

    "text-generation": {
        "label": "Text Generation",
        "category": "AI",
        "icon": "🤖",
        "embedding_text": (
            "text generation generate write draft compose prompt ai llm gpt language model creative writing produce"
        ),
        "default_config": {
            "prompt": "{{text}}",
            "max_tokens": 200,
            "temperature": 0.7,
            "model": "gpt-3.5-turbo",
        },
        "output_key": "generated_text",
        "input_key": "prompt",
        "param_rules": [
            (r"\b(gpt-4-turbo|gpt-4|gpt-3\.5-turbo)\b", "model", 1),
            (r"(\d+)\s*tokens?", "max_tokens", 1),
        ],
    },
    "summarization": {
        "label": "Summarization",
        "category": "AI",
        "icon": "📄",
        "embedding_text": (
            "summarize summarization condense shorten abstract tldr brief long text document overview synopsis reduce"
        ),
        "default_config": {
            "text": "{{text}}",
            "max_length": 130,
            "min_length": 30,
            "model": "gpt-3.5-turbo",
        },
        "output_key": "summary",
        "input_key": "text",
        "param_rules": [
            (r"\b(gpt-4-turbo|gpt-4|gpt-3\.5-turbo)\b", "model", 1),
        ],
    },
    "ai-decision": {
        "label": "AI Decision",
        "category": "AI",
        "icon": "🧠",
        "embedding_text": (
            "ai decision choose pick select best option criteria judge evaluate route intelligent yes no"
        ),
        "default_config": {
            "decision_criteria": "{{text}}",
            "options": ["yes", "no"],
            "confidence_threshold": 0.7,
        },
        "output_key": "decision",
        "input_key": "decision_criteria",
        "param_rules": [],
    },
    "question-answer": {
        "label": "Question & Answer",
        "category": "AI",
        "icon": "❓",
        "embedding_text": (
            "question answer qa query ask respond knowledge context grounded rag lookup faq"
        ),
        "default_config": {
            "question": "",
            "context_text": "{{text}}",
            "model": "gpt-3.5-turbo",
        },
        "output_key": "answer",
        "input_key": "context_text",
        "param_rules": [],
    },
    "text-classification": {
        "label": "Text Classification",
        "category": "AI",
        "icon": "🏷️",
        "embedding_text": (
            "classify classification categorize label sentiment positive negative neutral category tag text"
        ),
        "default_config": {
            "text": "{{text}}",
            "categories": ["positive", "negative", "neutral"],
            "model": "gpt-3.5-turbo",
        },
        "output_key": "classification",
        "input_key": "text",
        "param_rules": [],
    },
    "named-entity": {
        "label": "Named Entity Recognition",
        "category": "AI",
        "icon": "🔍",
        "embedding_text": (
            "named entity recognition ner extract people persons organizations locations places dates money entities text"
        ),
        "default_config": {
            "text": "{{text}}",
            "entity_types": ["PERSON", "ORGANIZATION", "LOCATION", "DATE"],
            "model": "gpt-3.5-turbo",
        },
        "output_key": "entities",
        "input_key": "text",
        "param_rules": [],
    },
    "translation": {
        "label": "Translation",
        "category": "AI",
        "icon": "🌍",
        "embedding_text": (
            "translate translation language convert french spanish german english japanese arabic chinese "
            "korean russian hindi portuguese multilingual localize"
        ),
        "default_config": {
            "text": "{{text}}",
            "target_language": "english",
            "source_language": "auto",
            "model": "gpt-3.5-turbo",
        },
        "output_key": "translated_text",
        "input_key": "text",
        "param_rules": [
            (
                r"\bto\s+(french|spanish|german|english|japanese|arabic|chinese|korean|russian|hindi|portuguese|italian)\b",
                "target_language", 1,
            ),
            (
                r"\b(french|spanish|german|japanese|arabic|chinese|korean|russian|hindi|portuguese|italian)\b",
                "target_language", 1,
            ),
        ],
    },
    "content-generation": {
        "label": "Content Generation",
        "category": "AI",
        "icon": "✍️",
        "embedding_text": (
            "content generation write create blog post email social media article product description press release marketing copy"
        ),
        "default_config": {
            "topic": "{{text}}",
            "content_type": "blog_post",
            "style": "professional",
            "length": "medium",
            "model": "gpt-3.5-turbo",
        },
        "output_key": "generated_content",
        "input_key": "topic",
        "param_rules": [
            (r"\b(blog_post|blog|email|social_media|social|article|product_description|product|press_release|press)\b", "content_type", 1),
            (r"\b(professional|informative|creative|casual|formal|humorous)\b", "style", 1),
            (r"\b(short|medium|long)\b", "length", 1),
        ],
    },
    "search-agent": {
        "label": "Search Agent",
        "category": "AI",
        "icon": "🔎",
        "embedding_text": (
            "search web internet google look up find information news query browse research agent serpapi"
        ),
        "default_config": {"query": "{{text}}", "max_results": 3},
        "output_key": "answer",
        "input_key": "query",
        "param_rules": [
            (r"(\d+)\s*results?", "max_results", 1),
        ],
    },
    "data-analyst-agent": {
        "label": "Data Analyst Agent",
        "category": "AI",
        "icon": "📊",
        "embedding_text": (
            "data analyst analysis chart graph visualization dataset statistics trend insights report csv excel pandas"
        ),
        "default_config": {
            "analysis_request": "{{text}}",
            "dataset": "",
            "create_visualization": True,
        },
        "output_key": "insight",
        "input_key": "analysis_request",
        "param_rules": [],
    },
    "text-embedding": {
        "label": "Text Embedding",
        "category": "AI",
        "icon": "🔢",
        "embedding_text": (
            "text embedding vector dense representation semantic similarity openai ada embeddings encode"
        ),
        "default_config": {
            "texts": "{{text}}",
            "model": "text-embedding-3-small",
        },
        "output_key": "embeddings",
        "input_key": "texts",
        "param_rules": [
            (r"\b(text-embedding-3-large|text-embedding-3-small|text-embedding-ada-002)\b", "model", 1),
        ],
    },

    "openai-auth": {
        "label": "OpenAI Auth",
        "category": "Authentication",
        "icon": "🔑",
        "embedding_text": "openai auth key authentication gpt api key setup configure credential sk-",
        "default_config": {"api_key": ""},
        "output_key": "openai_auth",
        "input_key": None,
        "param_rules": [],
    },
    "gemini-auth": {
        "label": "Gemini Auth",
        "category": "Authentication",
        "icon": "🔑",
        "embedding_text": "gemini google auth key authentication api key setup configure credential AIzaSy",
        "default_config": {"api_key": ""},
        "output_key": "gemini_auth",
        "input_key": None,
        "param_rules": [],
    },
    "claude-auth": {
        "label": "Claude Auth",
        "category": "Authentication",
        "icon": "🔑",
        "embedding_text": "claude anthropic auth key authentication api key setup configure credential sk-ant",
        "default_config": {"api_key": ""},
        "output_key": "claude_auth",
        "input_key": None,
        "param_rules": [],
    },

    "gmailSearch": {
        "label": "Gmail Search",
        "category": "Gmail",
        "icon": "📬",
        "embedding_text": "gmail search email inbox find messages unread read google mail filter",
        "default_config": {"query": "is:unread", "maxResults": 10},
        "output_key": "gmail_messages",
        "input_key": "query",
        "param_rules": [
            (r"(\d+)\s*(?:emails?|messages?|results?)", "maxResults", 1),
        ],
    },
    "gmailSend": {
        "label": "Gmail Send",
        "category": "Gmail",
        "icon": "📤",
        "embedding_text": "gmail send email google mail message write compose to recipient deliver",
        "default_config": {"to": "", "subject": "{{text}}", "body": "{{text}}"},
        "output_key": "gmail_sent",
        "input_key": "body",
        "param_rules": [
            (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "to", 0),
        ],
    },
    "gmailCreateDraft": {
        "label": "Gmail Draft",
        "category": "Gmail",
        "icon": "📝",
        "embedding_text": "gmail draft email create compose save pending google mail",
        "default_config": {"to": "", "subject": "", "body": "{{text}}"},
        "output_key": "gmail_draft_id",
        "input_key": "body",
        "param_rules": [
            (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "to", 0),
        ],
    },
    "gmailReply": {
        "label": "Gmail Reply",
        "category": "Gmail",
        "icon": "↩️",
        "embedding_text": "gmail reply respond email thread google mail answer follow up",
        "default_config": {"replyBody": "{{text}}", "replyAll": False, "sendDraft": True},
        "output_key": "reply_successful",
        "input_key": "replyBody",
        "param_rules": [],
    },
    "gmailMarkRead": {
        "label": "Gmail Mark Read",
        "category": "Gmail",
        "icon": "✅",
        "embedding_text": "gmail mark read unread email messages flag",
        "default_config": {"markAsRead": True},
        "output_key": "gmail_marked_as_read",
        "input_key": None,
        "param_rules": [],
    },
    "gmailAddLabel": {
        "label": "Gmail Label",
        "category": "Gmail",
        "icon": "🏷️",
        "embedding_text": "gmail label add remove tag email organize google mail categorize",
        "default_config": {"labelsToAdd": "IMPORTANT", "labelsToRemove": ""},
        "output_key": "gmail_labels_added",
        "input_key": None,
        "param_rules": [],
    },
    "googleCalendar": {
        "label": "Google Calendar",
        "category": "Google",
        "icon": "📅",
        "embedding_text": "google calendar event create schedule meeting appointment reminder invite gcal",
        "default_config": {
            "summary": "{{text}}",
            "startTime": "",
            "endTime": "",
            "calendarId": "primary",
        },
        "output_key": "calendar_event_id",
        "input_key": "summary",
        "param_rules": [],
    },

    "postgres-db": {
        "label": "PostgreSQL",
        "category": "Database",
        "icon": "🐘",
        "embedding_text": "postgres postgresql database sql query relational data insert select update delete table",
        "default_config": {
            "host": "localhost",
            "port": 5432,
            "database": "",
            "username": "postgres",
            "password": "",
            "query": "SELECT 1",
        },
        "output_key": "rows",
        "input_key": "query",
        "param_rules": [],
    },
    "mysql-db": {
        "label": "MySQL",
        "category": "Database",
        "icon": "🗄️",
        "embedding_text": "mysql database sql query relational data insert select update delete table",
        "default_config": {
            "host": "localhost",
            "port": 3306,
            "database": "",
            "username": "root",
            "password": "",
            "query": "SELECT 1",
        },
        "output_key": "rows",
        "input_key": "query",
        "param_rules": [],
    },
    "mongo-db": {
        "label": "MongoDB",
        "category": "Database",
        "icon": "🍃",
        "embedding_text": "mongodb mongo nosql database document collection query find insert update aggregate bson",
        "default_config": {
            "connection_string": "mongodb://localhost:27017",
            "database": "",
            "collection": "",
            "operation": "find",
        },
        "output_key": "documents",
        "input_key": "query",
        "param_rules": [],
    },
    "db-health-check": {
        "label": "DB Health Check",
        "category": "Database",
        "icon": "💊",
        "embedding_text": "database health check ping status connection latency monitor uptime alive",
        "default_config": {
            "db_type": "postgres",
            "host": "localhost",
            "port": 5432,
            "timeout_seconds": 5,
        },
        "output_key": "status",
        "input_key": None,
        "param_rules": [
            (r"\b(postgres|postgresql|mysql|mongo|mongodb)\b", "db_type", 1),
        ],
    },
<<<<<<< HEAD

=======
>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    "k-means": {
        "label": "K-Means Clustering",
        "category": "ML",
        "icon": "🔵",
        "embedding_text": (
            "k-means kmeans clustering cluster group data points unsupervised machine learning"
        ),
        "default_config": {"data": "{{data}}", "n_clusters": 3, "max_iter": 300},
        "output_key": "cluster_labels",
        "input_key": "data",
        "param_rules": [
            (r"\b(\d+)\s*clusters?\b", "n_clusters", 1),
            (r"\bk\s*=\s*(\d+)\b", "n_clusters", 1),
        ],
    },
    "clusterization": {
        "label": "Clusterization",
        "category": "ML",
        "icon": "🌐",
        "embedding_text": (
            "clusterization dbscan hierarchical mini-batch agglomerative density unsupervised grouping"
        ),
        "default_config": {
            "data": "{{data}}",
            "algorithm": "dbscan",
            "eps": 0.5,
            "min_samples": 5,
        },
        "output_key": "cluster_labels",
        "input_key": "data",
        "param_rules": [
            (r"\b(dbscan|hierarchical|minibatch|mini-batch)\b", "algorithm", 1),
        ],
    },
    "python-task": {
        "label": "Python Task",
        "category": "ML",
        "icon": "🐍",
        "embedding_text": (
            "python code execute run script custom logic task function process transform compute script"
        ),
        "default_config": {"code": "result = input_data", "data": ""},
        "output_key": "result",
        "input_key": "data",
        "param_rules": [],
    },
    "linear-regression": {
        "label": "Linear Regression",
        "category": "ML",
        "icon": "📈",
        "embedding_text": (
            "linear regression predict supervised machine learning fit model train forecast trend slope"
        ),
        "default_config": {
            "X_train": "{{data}}",
            "y_train": "{{labels}}",
            "X_predict": "",
        },
        "output_key": "predictions",
        "input_key": "X_train",
        "param_rules": [],
    },
    "anomaly-detection": {
        "label": "Anomaly Detection",
        "category": "ML",
        "icon": "🚨",
        "embedding_text": (
            "anomaly detection outlier isolation forest unusual abnormal pattern fraud time series detect"
        ),
        "default_config": {
            "data": "{{data}}",
            "contamination": 0.1,
            "n_estimators": 100,
        },
        "output_key": "anomaly_labels",
        "input_key": "data",
        "param_rules": [
            (r"(\d+(?:\.\d+)?)\s*contamination", "contamination", 1),
        ],
    },
<<<<<<< HEAD

=======
>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
    "cp-solver": {
        "label": "CP Solver",
        "category": "Competitive Programming",
        "icon": "⚡",
        "embedding_text": (
            "competitive programming problem solver solution generate code algorithm leetcode codeforces dp"
        ),
        "default_config": {"problem": "{{text}}"},
        "output_key": "code",
        "input_key": "problem",
        "param_rules": [],
    },
    "cp-testgen": {
        "label": "CP Test Generator",
        "category": "Competitive Programming",
        "icon": "🧪",
        "embedding_text": (
            "test cases generate competitive programming tests input output edge cases cp"
        ),
        "default_config": {"problem": "{{text}}", "num_tests": 5},
        "output_key": "testcases",
        "input_key": "problem",
        "param_rules": [
            (r"(\d+)\s*tests?", "num_tests", 1),
        ],
    },
    "cp-executor": {
        "label": "CP Executor",
        "category": "Competitive Programming",
        "icon": "▶️",
        "embedding_text": (
            "execute run code test cases competitive programming pass fail judge verdict"
        ),
        "default_config": {"code": "{{code}}", "testcases": "{{testcases}}"},
        "output_key": "all_passed",
        "input_key": "code",
        "param_rules": [],
    },
    "cp-agent": {
        "label": "CP Agent",
        "category": "Competitive Programming",
        "icon": "🤖",
        "embedding_text": (
            "competitive programming agent full pipeline auto solve test iterate fix problem statement"
        ),
        "default_config": {"problem": "{{text}}", "max_iterations": 3},
        "output_key": "final_code",
        "input_key": "problem",
        "param_rules": [
            (r"(\d+)\s*iterations?", "max_iterations", 1),
        ],
    },

    "ssl-cert-checker": {
        "label": "SSL Certificate Checker",
        "category": "Security",
        "icon": "🔒",
        "embedding_text": (
            "ssl tls certificate check inspect expiry validity domain https security cert"
        ),
        "default_config": {"hostname": "", "port": 443, "timeout_seconds": 10},
        "output_key": "days_until_expiry",
        "input_key": "hostname",
        "param_rules": [
            (r"\b([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b", "hostname", 1),
        ],
    },
    "port-scanner": {
        "label": "Port Scanner",
        "category": "Security",
        "icon": "🔭",
        "embedding_text": (
            "port scanner scan network open ports tcp host ip address security probe nmap pentest"
        ),
        "default_config": {"host": "", "ports": "22,80,443,8080", "timeout_ms": 1000},
        "output_key": "open_ports",
        "input_key": "host",
        "param_rules": [
            (r"\b(\d{1,5}-\d{1,5})\b", "ports", 1),
        ],
    },
    "get-my-ip": {
        "label": "Get My IP",
        "category": "Security",
        "icon": "🌍",
        "embedding_text": (
            "get my ip public ip address geolocation country city org network"
        ),
        "default_config": {"include_geo": True},
        "output_key": "public_ip",
        "input_key": None,
        "param_rules": [],
    },
    "hash-generator": {
        "label": "Hash Generator",
        "category": "Security",
        "icon": "#️⃣",
        "embedding_text": (
            "hash generate sha256 sha512 md5 sha1 blake2 hmac cryptographic checksum digest"
        ),
        "default_config": {
            "data": "{{text}}",
            "algorithm": "sha256",
            "output_format": "hex",
        },
        "output_key": "hash",
        "input_key": "data",
        "param_rules": [
            (r"\b(md5|sha1|sha256|sha512|sha3_256|blake2b)\b", "algorithm", 1),
            (r"\b(hex|base64)\b", "output_format", 1),
        ],
    },
    "file-integrity-check": {
        "label": "File Integrity Check",
        "category": "Security",
        "icon": "🛡️",
        "embedding_text": (
            "file integrity check tamper detect hash verify compare expected actual"
        ),
        "default_config": {
            "content": "{{text}}",
            "expected_hash": "",
            "algorithm": "sha256",
        },
        "output_key": "tampered",
        "input_key": "content",
        "param_rules": [
            (r"\b(md5|sha1|sha256|sha512)\b", "algorithm", 1),
        ],
    },
    "password-brute-force": {
        "label": "Password Brute Force",
        "category": "Security",
        "icon": "🔓",
        "embedding_text": (
            "password brute force credential testing pentest wordlist login authentication security authorized"
        ),
        "default_config": {
            "target_url": "",
            "username": "admin",
            "wordlist": "password123,admin,letmein",
            "max_attempts": 20,
        },
        "output_key": "found_password",
        "input_key": "target_url",
        "param_rules": [
            (r"https?://\S+", "target_url", 0),
        ],
    },
    "sql-injection-scanner": {
        "label": "SQL Injection Scanner",
        "category": "Security",
        "icon": "💉",
        "embedding_text": (
            "sql injection scanner vulnerability detect security test payload parameter attack authorized pentest"
        ),
        "default_config": {
            "target_url": "",
            "parameter": "id",
            "method": "GET",
            "baseline_value": "1",
        },
        "output_key": "is_vulnerable",
        "input_key": "target_url",
        "param_rules": [
            (r"https?://\S+", "target_url", 0),
            (r"\bparameter\s*[:=]?\s*(\w+)", "parameter", 1),
        ],
    },
}

<<<<<<< HEAD
=======

>>>>>>> 85cd4ff4d7c00e6d53e8d13a8b3432427c1c87fb
ALL_NODE_TYPES: List[str] = list(NODE_CATALOG.keys())

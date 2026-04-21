import React from 'react';
import { SiOpenai, SiGooglegemini, SiAnthropic } from 'react-icons/si';

export interface NodeInput {
  id: string;
  label: string;
  required: boolean;
  type: string;
}

export interface NodeOutput {
  id: string;
  label: string;
  type: string;
}

export interface WorkflowNodeData {
  id: string;
  [key: string]: unknown;
  label: string;
  nodeType: string;
  icon: React.ReactNode;
  config?: Record<string, unknown>;
  inputs?: NodeInput[];
  outputs?: NodeOutput[];
  description: string;
}

export interface NodeTemplate {
  id: string;
  type: string;
  label: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  defaultConfig?: Record<string, unknown>;
  inputs?: NodeInput[];
  outputs?: NodeOutput[];
}

export const nodeTemplates: NodeTemplate[] = [
  {
    id: '0',
    type: 'start',
    label: 'Start',
    description: 'Entry point of the workflow. No inputs required. Returns: execution_id, node_executed_at (timestamp).',
    category: 'Triggers',
    icon: '🚀',
    defaultConfig: {
      context: {}
    },
    inputs: [],
    outputs: [{ id: 'output', label: 'Context', type: 'object' }],
  },
  {
    id: 'auth-1',
    type: 'openai-auth',
    label: 'OpenAI Auth',
    description: 'Adds OpenAI API Key to the execution environment for AI nodes to use.',
    category: 'Authentication',
    icon: <SiOpenai size={20} className="text-emerald-500" />,
    defaultConfig: {
      api_key: ''
    },
    inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Auth Success', type: 'object' }],
  },
  {
    id: 'auth-2',
    type: 'gemini-auth',
    label: 'Gemini Auth',
    description: 'Adds Google Gemini API Key to the execution environment for AI nodes to use.',
    category: 'Authentication',
    icon: <SiGooglegemini size={20} className="text-blue-500" />,
    defaultConfig: {
      api_key: ''
    },
    inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Auth Success', type: 'object' }],
  },
  {
    id: 'auth-3',
    type: 'claude-auth',
    label: 'Claude Auth',
    description: 'Adds Anthropic Claude API Key to the execution environment for AI nodes to use.',
    category: 'Authentication',
    icon: <SiAnthropic size={20} className="text-amber-600" />,
    defaultConfig: {
      api_key: ''
    },
    inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Auth Success', type: 'object' }],
  },
  {
    id: '1',
    type: 'trigger',
    label: 'Webhook',
    description: 'Receives HTTP webhook calls to start the workflow. Returns: webhook_payload (object), webhook_method (string), triggered_at (string).',
    category: 'Triggers',
    icon: '🔗',
    defaultConfig: {
    url: "https://webhook.site/your-fixed-endpoint",
    method: "POST",
    headers: {
      "Authorization": "Bearer fixed-token",
      "Content-Type": "application/json"
    },
    payload: {
      userId: "12345",
      email: "user@example.com"
    }
  },  
    inputs: [],
    outputs: [{ id: 'output', label: 'Data', type: 'object' }],
  },
  {
    id: '3',
    type: 'condition',
    label: 'Filter',
    description: 'Inputs: data (object). Evaluates a field condition. Returns: condition_result (boolean), branch ("true"/"false"), evaluation_details (object).',
    category: 'Logic',
    icon: '🎯',
    defaultConfig: {
      defaultConfig: {
        condition: {
          field: "status",          
          operator: "==",           
          value: "approved"         
        }
      }
      
    },
    inputs: [{ id: 'input', label: 'Data', required: true, type: 'object' }],
    outputs: [
      { id: 'true', label: 'True', type: 'object' },
      { id: 'false', label: 'False', type: 'object' },
    ],
  },
  {
    id: '4',
    type: 'transform',
    label: 'Transform',
    description: 'Inputs: data (object). Maps and reshapes fields using a key mapping. Returns: transformed data + node_executed_at (string).',
    category: 'Processing',
    icon: '🔄',
    defaultConfig: {
      mapping: {
        fullName: 'name',
        emailAddress: 'email',
        ageInYears: 'age'
      }
    },
    inputs: [{ id: 'input', label: 'Data', required: true, type: 'object' }],
    outputs: [{ id: 'output', label: 'Transformed', type: 'object' }],
  },
  {
    id: '5',
    type: 'delay',
    label: 'Delay',
    description: 'Inputs: duration (ms), message (string). Pauses the workflow. Returns: delay_completed (boolean), duration_ms (number), completed_at (string).',
    category: 'Utilities',
    icon: '⏱️',
    defaultConfig: { 
      duration: 1000,
      message: 'Delay completed',
      reason: 'Workflow timing'
    },
    inputs: [{ id: 'input', label: 'Data', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Data', type: 'object' }],
  },
  {
    id: '6',
    type: 'httpGet',
    label: 'HTTP GET',
    description: 'Inputs: url (string), headers (object). Sends a GET request. Returns: http_status_code (number), http_response_json (object), http_request_successful (boolean).',
    category: 'Actions',
    icon: '🔍',
    defaultConfig: {
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      body: null,
      useGoogleAuth: false
    },
    inputs: [{ id: 'input', label: 'Input', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Response', type: 'object' }],
  },
  {
    id: '7',
    type: 'httpPost',
    label: 'HTTP POST',
    description: 'Inputs: url (string), body (object), headers (object). Sends a POST request. Returns: http_status_code (number), http_response_json (object), http_request_successful (boolean).',
    category: 'Actions',
    icon: '📤',
    defaultConfig: {
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        title: "Sample Title",
        body: "Sample content",
        userId: 1
      },
      useGoogleAuth: false
    }
    ,
    inputs: [{ id: 'input', label: 'Input', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Response', type: 'object' }],
  },
  {
    id: '8',
    type: 'httpPut',
    label: 'HTTP PUT',
    description: 'Inputs: url (string), body (object), headers (object). Sends a PUT request to update a resource. Returns: http_status_code (number), http_request_successful (boolean).',
    category: 'Actions',
    icon: '🛠️',
    defaultConfig: {
      url: 'https://api.example.com/resource',
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        updatedKey: "updatedValue"
      },
      useGoogleAuth: false
    },
    inputs: [{ id: 'input', label: 'Input', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Response', type: 'object' }],
  },
  {
    id: '9',
    type: 'httpDelete',
    label: 'HTTP DELETE',
    description: 'Inputs: url (string), headers (object). Deletes a resource. Returns: http_status_code (number), http_request_successful (boolean).',
    category: 'Actions',
    icon: '🗑️',
    defaultConfig: {
      url: 'https://api.example.com/resource/123',
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json"
      },
      body: null,
      useGoogleAuth: false
    },
    inputs: [{ id: 'input', label: 'Input', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Response', type: 'object' }],
  },
  {
    id: '10',
    type: 'text-generation',
    label: 'Text Generation',
    description: 'Inputs: prompt (string, supports {{variables}}). Uses GPT to generate text. Returns: generated_text (string), original_prompt (string), model_used (string).',
    category: 'AI',
    icon: '🤖',
    defaultConfig: { prompt: '' },
    inputs: [{ id: 'input', label: 'Prompt', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Generated Text', type: 'string' }],
  },
  {
    id: '11',
    type: 'summarization',
    label: 'Summarization',
    description: 'Inputs: text (string, supports {{variables}}), max_length (number), min_length (number). Returns: summary (string), original_text (string), model_used (string).',
    category: 'AI',
    icon: '📄',
    defaultConfig: { text: '' },
    inputs: [{ id: 'input', label: 'Text', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Summary', type: 'string' }],
  },
  {
    id: '12',
    type: 'ai-decision',
    label: 'AI Decision',
    description: 'Inputs: decision_criteria (string), options (array), confidence_threshold (0–1). Uses GPT to pick an option. Returns: decision (string), confidence (number), reasoning (string), threshold_met (boolean).',
    category: 'AI',
    icon: '🧠',
    defaultConfig: { decision_criteria: 'Make a decesion on basis of' ,options:[],confidence_threshold:0.5},
    inputs: [{ id: 'input', label: 'Input', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Decision', type: 'string' }],
  },
  {
    id: '13',
    type: 'question-answer',
    label: 'Question Answer',
    description: 'Inputs: question (string), context_text (optional string). Uses GPT to answer a question from context. Returns: answer (string), question (string), context_text (string).',
    category: 'AI',
    icon: '❓',
    defaultConfig: { question: '', context_text: '' },
    inputs: [
      { id: 'question', label: 'Question', required: true, type: 'string' }
    ],
    outputs: [{ id: 'output', label: 'Answer', type: 'string' }],
  },
  {
    id: '14',
    type: 'text-classification',
    label: 'Text Classification',
    description: 'Inputs: text (string), categories (array of labels). Classifies text into one category. Returns: classification (string), confidence (number), categories (array).',
    category: 'AI',
    icon: '🏷️',
    defaultConfig: { text: '',catgories:[] },
    inputs: [{ id: 'input', label: 'Text', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Class', type: 'string' }],
  },
  {
    id: '15',
    type: 'named-entity',
    label: 'Named Entity Recognition',
    description: 'Inputs: text (string), entity_types (array e.g. PERSON, LOCATION). Extracts named entities. Returns: entities (array), entity_types (array), num_entities (number).',
    category: 'AI',
    icon: '🔖',
    defaultConfig: { text: '' ,entity_types:[]},
    inputs: [{ id: 'input', label: 'Text', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Entities', type: 'object' }],
  },
  {
    id: '16',
    type: 'translation',
    label: 'Translation',
    description: 'Inputs: text (string), source_language ("auto" or language code), target_language (string). Returns: translated_text (string), source_language (string), target_language (string).',
    category: 'AI',
    icon: '🌐',
    defaultConfig: { text: 'Any Text U Want', source_language: 'en' ,target_language:"french"},
    inputs: [
      { id: 'input', label: 'Text', required: true, type: 'string' }
    ],
    outputs: [{ id: 'output', label: 'Translated Text', type: 'string' }],
  },
  {
    id: '17',
    type: 'content-generation',
    label: 'Content Generation',
    description: 'Inputs: topic (string), content_type (blog_post/email/article/social_media), style (string), length (short/medium/long). Returns: generated_content (string), word_count (number), topic (string).',
    category: 'AI',
    icon: '✍️',
    defaultConfig: { topic:"",content_type: 'blog_post',style: 'informative',length: 'medium' },
    inputs: [{ id: 'input', label: 'Prompt', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Content', type: 'string' }],
  },
  {
    id: '18',
    type: 'search-agent',
    label: 'Search Agent',
    description: 'Inputs: query (string), max_results (number). Searches the web with AI synthesis. Returns: answer (string), search_results (array), sources_used (number), query (string).',
    category: 'AI',
    icon: '🔍',
    defaultConfig: { query: '' },
    inputs: [{ id: 'input', label: 'Query', required: true, type: 'string' }],
    outputs: [{ id: 'output', label: 'Results', type: 'object' }],
  },
  {
    id: '19',
    type: 'data-analyst-agent',
    label: 'Data Analyst Agent',
    description: 'Inputs: analysis_request (string), dataset (object, optional), create_visualization (boolean). Returns: analysis_results (object), insights (string), visualization (base64 image), columns (array).',
    category: 'AI',
    icon: '📊',
    defaultConfig: { data: '', analysisType: '',create_visualization:'',dataset:''},
    inputs: [
      { id: 'data', label: 'Data', required: true, type: 'object' },
      { id: 'analysisType', label: 'analysis_request', required: false, type: 'string' },
    ],
    outputs: [{ id: 'output', label: 'Analysis Result', type: 'object' }],
  },
  {
    id: '20',
    type: 'googleCalendar',
    label: 'Google Calendar',
    description: 'Inputs: summary (string), startTime, endTime, description, location, calendarId. Creates a Google Calendar event. Returns: calendar_event_id, calendar_event_link, event_created (boolean).',
    category: 'Actions',
    icon: '📅',
    defaultConfig: {
      summary: 'Team Sync Meeting',
      startTime: '27 June 2025, 10:00 AM',
      endTime: '27 June 2025, 11:00 AM',
      description: 'Weekly team sync to discuss project updates and blockers.',
      location: 'Zoom - https://zoom.us/j/1234567890',
      calendarId: 'primary',
      useGoogleAuth: true,
    },    
    inputs: [{ id: 'input', label: 'Data', required: false, type: 'object' }],
    outputs: [{ id: 'output', label: 'Calendar Event', type: 'object' }],
  },
  {
    id: '21',
    type: 'calculator',
    label: 'Calculator',
    description: 'Inputs: expression (string, e.g. "2 + 3 * 5", supports {{variables}}). Evaluates a math expression. Returns: result (number), expression (string), calculation_successful (boolean).',
    category: 'Utilities',
    icon: '🧮',
    defaultConfig: {
      expression: '2 + 3 * 5',
    },
    inputs: [
      {
        id: 'input',
        label: 'Context',
        type: 'object',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'output',
        label: 'Result',
        type: 'object',
      },
    ],
  },
  {
    id: '22',
    type: 'currentTime',
    label: 'Current Time',
    description: 'Inputs: timeZone (string, e.g. "Asia/Kolkata"). Gets the current timestamp. Returns: current_time (string), time_zone (string).',
    category: 'Utilities',
    icon: '🕒',
    defaultConfig: {
      timeZone: 'Asia/Kolkata',
    },
    inputs: [],
    outputs: [
      {
        id: 'output',
        label: 'Timestamp',
        type: 'object',
      },
    ],
  },
    {
      id: '23',
      type: 'gmailSend',
      label: 'Gmail Send',
      description: 'Inputs: to, cc, bcc (strings), subject (string), body (string). Sends an email via Gmail. Returns: gmail_message_id (string), gmail_sent (boolean), sent_at (string).',
      category: 'Gmail',
      icon: '📧',
      defaultConfig: {
        to: "primary@example.com",
        cc: "cc1@example.com, cc2@example.com",     
        bcc: "hidden1@example.com, hidden2@example.com", 
        subject: "Hello from Workflow",
        body: "This is an automated email sent from your workflow.",
        useGoogleAuth: true,
      },
      inputs: [{ id: 'input', label: 'Data', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Email Result', type: 'object' }],
    },
    {
      id: '24',
      type: 'gmailSearch',
      label: 'Gmail Search',
      description: 'Inputs: query (string, Gmail search syntax), maxResults (number). Searches Gmail inbox. Returns: gmail_messages (array), gmail_message_count (number), search_successful (boolean).',
      category: 'Gmail',
      icon: '🔍',
      defaultConfig: {
        query: 'is:unread',
        maxResults: 10,
        includeSpamTrash: false,
        useGoogleAuth: true,
      },
      inputs: [{ id: 'input', label: 'Search Data', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Search Results', type: 'object' }],
    },
    {
      id: '25',
      type: 'gmailMarkRead',
      label: 'Gmail Mark Read',
      description: 'Inputs: messageIds (comma-separated string), markAsRead (boolean). Marks messages read/unread. Returns: gmail_messages_modified (number), modification_successful (boolean).',
      category: 'Gmail',
      icon: '👁️',
      defaultConfig: {
        messageIds: "18c1234567890abcdef, 18cabcdef1234567890",
        markAsRead: true,
        useGoogleAuth: true
      },
      inputs: [{ id: 'input', label: 'Message Data', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Update Result', type: 'object' }],
    },
    {
      id: '26',
      type: 'gmailAddLabel',
      label: 'Gmail Add Label',
      description: 'Inputs: messageIds (string), labelsToAdd (string), labelsToRemove (string). Manages Gmail labels. Returns: gmail_labels_added (array), gmail_messages_modified (number), label_modification_successful (boolean).',
      category: 'Gmail',
      icon: '🏷️',
      defaultConfig: {
        messageIds: "18c1234567890abcdef, 18cabcdef1234567890",
        labelsToAdd: "SPAM",
        labelsToRemove: "UNREAD",
        useGoogleAuth: true,
      },
      inputs: [{ id: 'input', label: 'Message Data', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Label Result', type: 'object' }],
    },
    {
      id: '27',
      type: 'gmailCreateDraft',
      label: 'Gmail Create Draft',
      description: 'Inputs: to, cc, bcc (strings), subject (string), body (string). Creates a Gmail draft. Returns: gmail_draft_id (string), gmail_draft_subject (string), draft_creation_successful (boolean).',
      category: 'Gmail',
      icon: '📝',
      defaultConfig: {
        to: "recipient@example.com",
        cc: "ccuser1@example.com, ccuser2@example.com",
        bcc: "bccuser1@example.com, bccuser2@example.com",
        subject: "Draft Subject",
        body: "This is the body of the draft email.",
        useGoogleAuth: true
      },
      inputs: [{ id: 'input', label: 'Draft Data', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Draft Result', type: 'object' }],
    },
    {
      id: '2',
      type: 'gmailReply',
      label: 'Gmail Reply',
      description: 'Inputs: messageId (string), replyBody (string), replyAll (boolean). Replies to a Gmail thread. Returns: gmail_reply_message_id (string), gmail_reply_thread_id (string), reply_successful (boolean).',
      category: 'Gmail',
      icon: '↩️',
      defaultConfig: {
        messageId: "18cabcdef1234567890",  
        replyBody: "Thank you for your email. I'll get back to you shortly.",
        replyAll: false,
        useGoogleAuth: true
      },
      inputs: [{ id: 'input', label: 'Reply Data', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Reply Result', type: 'object' }],
    },
    {
      id: '28',
      type: 'action',
      label: 'Send Email',
      description: 'Inputs: to (string), subject (string), body (string). Sends a simple email notification. Returns: email_sent (boolean), recipient (string), subject (string), sent_at (string).',
      category: 'Actions',
      icon: '📧',
      defaultConfig: {
        to: "recipient@example.com",      
        subject: "Notification Subject",  
        body: "This is the message body." 
      },
      inputs: [{ id: 'input', label: 'Data', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Result', type: 'object' }]
    },
    {
      id: '29',
      type: 'postgres-db',
      label: 'PostgreSQL DB',
      description: 'Connects to a PostgreSQL database and executes a SQL query. Inputs: query (string). Returns: result (array/object).',
      category: 'Database',
      icon: '🐘',
      defaultConfig: {
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'password',
        query: 'SELECT * FROM users LIMIT 10;'
      },
      inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Rows', type: 'object' }]
    },
    {
      id: '30',
      type: 'mysql-db',
      label: 'MySQL DB',
      description: 'Connects to a MySQL database and executes a SQL query. Inputs: query (string). Returns: result (array/object).',
      category: 'Database',
      icon: '🐬',
      defaultConfig: {
        host: 'localhost',
        port: 3306,
        database: 'mydb',
        username: 'user',
        password: 'password',
        query: 'SELECT * FROM users LIMIT 10;'
      },
      inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Rows', type: 'object' }]
    },
    {
      id: '31',
      type: 'mongo-db',
      label: 'MongoDB',
      description: 'Connects to a MongoDB database and executes a command/query. Returns: result (array/object).',
      category: 'Database',
      icon: '🍃',
      defaultConfig: {
        uri: 'mongodb://localhost:27017',
        database: 'mydb',
        collection: 'users',
        operation: 'find',
        query: '{}'
      },
      inputs: [{ id: 'input', label: 'Trigger', required: false, type: 'object' }],
      outputs: [{ id: 'output', label: 'Documents', type: 'object' }]
    },
    {
      id: '32',
      type: 'cp-solver',
      label: 'CP Code Solver',
      description: 'AI code solver for competitive programming. Inputs: problem (string). Returns: code (string).',
      category: 'AI Agents',
      icon: '💻',
      defaultConfig: {
        language: 'python',
        problem: ''
      },
      inputs: [{ id: 'input', label: 'Problem & Constraints', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Code', type: 'object' }]
    },
    {
      id: '33',
      type: 'cp-testgen',
      label: 'CP Test Generator',
      description: 'AI edge case generator. Inputs: problem (string). Returns: testcases (array of objects with input/output).',
      category: 'AI Agents',
      icon: '🧪',
      defaultConfig: {
        num_tests: 5,
        problem: ''
      },
      inputs: [{ id: 'input', label: 'Problem Statement', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Test Cases', type: 'object' }]
    },
    {
      id: '34',
      type: 'cp-executor',
      label: 'Code Executor (Python)',
      description: 'Securely executes Python code against provided test cases. Inputs: code (string), testcases (array). Returns: results (object).',
      category: 'AI Agents',
      icon: '⚙️',
      defaultConfig: {
        timeout: 2,
        code: '',
        testcases: []
      },
      inputs: [{ id: 'input', label: 'Code & Tests', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Execution Results', type: 'object' }]
    },
    {
      id: '35',
      type: 'cp-agent',
      label: 'Competitive Programming Agent',
      description: 'A ReAct loop that solves, generates tests, and executes code locally, fixing errors until all tests pass. Inputs: problem (string). Returns: final_code (string).',
      category: 'AI Agents',
      icon: '🏆',
      defaultConfig: {
        max_iterations: 3,
        language: 'python',
        problem: ''
      },
      inputs: [{ id: 'input', label: 'Problem Statement', required: true, type: 'object' }],
      outputs: [{ id: 'output', label: 'Solution Code', type: 'object' }]
    }
  ];
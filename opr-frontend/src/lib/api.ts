import { Tag } from '@/components/ui/tag-input';
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/workflows`;
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

export interface PdfUploadResult {
  text: string;
  pages: number;
  filename: string;
  char_count: number;
}

export async function uploadPdf(file: File): Promise<PdfUploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await axios.post<PdfUploadResult>(`${FASTAPI_URL}/upload-pdf`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


export type WorkflowProvider = "openai" | "gemini" | "claude";

export interface GeneratedWorkflow {
  nodes: unknown[];
  edges: unknown[];
}

export interface NodeSuggestion {
  type: string;
  label: string;
  category: string;
  icon: string;
}

export async function generateWorkflowFromPrompt(
  prompt: string,
  apiKey: string,
  provider: WorkflowProvider,
): Promise<GeneratedWorkflow> {
  const res = await axios.post<GeneratedWorkflow>(`${FASTAPI_URL}/workflow/generate`, {
    prompt,
    api_key: apiKey,
    provider,
  });
  return res.data;
}

export async function generateWorkflowFromKeywords(
  keywords: string[],
): Promise<GeneratedWorkflow> {
  const res = await axios.post<GeneratedWorkflow>(`${FASTAPI_URL}/workflow/from-keywords`, {
    keywords,
  });
  return res.data;
}

export async function fetchNodeSuggestions(): Promise<NodeSuggestion[]> {
  const res = await axios.get<{ nodes: NodeSuggestion[] }>(`${FASTAPI_URL}/workflow/node-suggestions`);
  return res.data.nodes;
}

export async function downloadResultsPdf(result: Record<string, unknown>): Promise<void> {
  const res = await axios.post(`${FASTAPI_URL}/generate-pdf`, result, { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `workflow-results-${(result?.executionId as string)?.slice(0, 8) ?? Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function getAuthToken() {
  const rawToken = localStorage.getItem('__Pearl_Token');
  if (!rawToken) throw new Error('User not authenticated');
  return `Bearer ${rawToken}`;
}

export interface WorkflowListItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowData: any;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function createWorkflow(data: {
  name: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowData: any;
}) {
  try {
    const token = getAuthToken();

    const response = await axios.post(`${API_BASE_URL}`, data, {
      headers: {
        Authorization: token,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

export async function fetchWorkflows(
  page = 0,
  size = 20
): Promise<PageResponse<WorkflowListItem>> {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_BASE_URL, {
      headers: { Authorization: token },
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
}

export async function fetchWorkflow(id: string): Promise<WorkflowListItem> {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflow:', error);
    throw error;
  }
}

export async function updateWorkflow(
  id: string,
  data: { name: string; description?: string; workflowData: object }
) {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
}

export async function deleteWorkflow(id: string) {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: token },
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
}

export async function runWorkflow(
  workflowId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowData: any = {},
   tags:Tag[],
  googleToken?: string
 
) {
  console.log("📌 runWorkflow called with ID:", workflowId);
  console.log("📌 Workflow data structure:", workflowData);
  
  try {
    const headers: Record<string, string> = {
      Authorization: getAuthToken(),
      "Content-Type": "application/json",
    };

    const nodes = workflowData?.nodes || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasGoogleNode = nodes.some((node: any) => {
      const url: string = node?.data?.url || "";
      const explicitGoogle = node?.data?.useGoogleAuth === true;
      const isGoogleCalendar = node?.type === "googleCalendar";
      const isGmailNode = node?.type?.startsWith("gmail");
      
      console.log("🔍 Checking node:", {
        id: node.id,
        type: node.type,
        url,
        useGoogleAuth: explicitGoogle,
        isGoogleCalendar,
        isGmailNode
      });
      
      return url.includes("googleapis.com") || explicitGoogle || isGoogleCalendar || isGmailNode;
    });
    
    console.log("🔍 Has Google node:", hasGoogleNode);
    
    if (hasGoogleNode) {
      const tokenToUse = googleToken || localStorage.getItem("__Google_Access_Token__");
      console.log("🔐 Token being sent:", tokenToUse ? "TOKEN_PRESENT" : "NO_TOKEN");
      
      if (tokenToUse) {
        headers["X-Google-Access-Token"] = tokenToUse;
        console.log("✅ Added X-Google-Access-Token header");
      } else {
        console.warn("⚠️ Missing Google access token for workflow with Google-auth node");
      }
    }

    console.log("📤 Request headers:", Object.keys(headers));
    const request={
      workflowData,
      returnVariables:tags.map(tag => tag.text),
      waitForCompletion: false,   // async: get executionId immediately for live tracking
    }
    const response = await axios.post(
      `${API_BASE_URL}/${workflowId}/run`,
      request,
      { headers }
    );

    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error running workflow:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Workflow run failed");
    }
    throw error;
  }
}


export async function pollForCompletion(
  executionId: string,
  timeoutMs = 120_000,
): Promise<Record<string, unknown>> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const url = `${apiBase}/api/v1/saga/execution/${executionId}/status`;

  const deadline = Date.now() + timeoutMs;
  const TERMINAL = new Set(["COMPLETED", "FAILED", "COMPENSATED", "COMPENSATING"]);

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch(url);
      if (!res.ok) continue;        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = await res.json();
      
      const state = body.sagaState || body.status || "";
      const steps = body.steps || [];
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allStepsDone = steps.length > 0 && steps.every((s: any) => 
        ["COMMITTED", "FAILED", "COMPENSATED"].includes(s.stepState)
      );

      if (TERMINAL.has(state) || allStepsDone) {
        const variables: Record<string, unknown> = {};
        for (const step of body.steps ?? []) {
          if (step.outputSnapshot) {
            try {
              const snap = JSON.parse(step.outputSnapshot) as Record<string, unknown>;
              Object.assign(variables, snap);
            } catch {}
          }
        }
        return {
          executionId,
          status: body.sagaState,
          variables,
          sagaId: body.sagaId,
          completedAt: body.completedAt,
        };
      }
    } catch {

    }
  }

  return { executionId, status: "TIMEOUT", variables: {} };
}
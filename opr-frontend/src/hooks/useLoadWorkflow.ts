import { useWorkflow } from "@/provider/statecontext";
import { fetchWorkflow } from "@/lib/api";

export function useLoadWorkflow() {
  const { loadWorkflow, setCurrentWorkflowId, updateWorkflowMetadata } = useWorkflow();

  return async (workflowId: string) => {
    const workflow = await fetchWorkflow(workflowId);

    const wd = workflow.workflowData as any;
    const nodes = (wd.nodes || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      position: n.position || { x: 0, y: 0 },
      configuration: (n.data || n.configuration || {}),
      inputs: [],
    }));
    const edges = (wd.edges || []).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      targetHandle: e.targetHandle ?? undefined,
    }));

    loadWorkflow({
      nodes,
      edges,
      metadata: {
        name: workflow.name,
        description: workflow.description || "",
        version: String(workflow.version ?? "1.0.0"),
        created: new Date(workflow.createdAt),
        lastModified: new Date(workflow.updatedAt),
      },
    });

    setCurrentWorkflowId(workflow.id);
    updateWorkflowMetadata({ name: workflow.name, description: workflow.description || "" });
  };
}

import { useWorkflow } from "@/provider/statecontext";
import { createWorkflow, updateWorkflow } from "@/lib/api";
import { serializeWorkflowForBackend } from "@/lib/serializeWorkflowData";

export function useSaveWorkflow() {
  const { getWorkflowExecutionData, currentWorkflowId, setCurrentWorkflowId } = useWorkflow();

  return async () => {
    const fullWorkflow = getWorkflowExecutionData();
    const workflowData = serializeWorkflowForBackend(fullWorkflow);

    const payload = {
      name: fullWorkflow.metadata.name || "Untitled Workflow",
      description: fullWorkflow.metadata.description,
      workflowData,
    };

    let response;
    if (currentWorkflowId) {
      // Re-save (update) existing workflow
      response = await updateWorkflow(currentWorkflowId, payload);
    } else {
      // First save — create new
      response = await createWorkflow(payload);
      setCurrentWorkflowId(response.id);
    }

    return response;
  };
}

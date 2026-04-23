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
      response = await updateWorkflow(currentWorkflowId, payload);
    } else {
      response = await createWorkflow(payload);
      setCurrentWorkflowId(response.id);
    }

    return response;
  };
}

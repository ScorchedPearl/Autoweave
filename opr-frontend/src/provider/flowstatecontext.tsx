"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface LastExecution {
  executionId: string;
  workflowId: string;
}

interface FlowStateContextType {
  lastExecution: LastExecution | null;
  setLastExecution: (exec: LastExecution | null) => void;
  workflowResult: any;
  setWorkflowResult: (result: any) => void;
  showResultPanel: boolean;
  setShowResultPanel: (show: boolean) => void;
  currentWorkflowTitle: string;
  setCurrentWorkflowTitle: (title: string) => void;
}

const FlowStateContext = createContext<FlowStateContextType>({
  lastExecution: null,
  setLastExecution: () => {},
  workflowResult: null,
  setWorkflowResult: () => {},
  showResultPanel: false,
  setShowResultPanel: () => {},
  currentWorkflowTitle: "Untitled Workflow",
  setCurrentWorkflowTitle: () => {},
});

export function FlowStateProvider({ children }: { children: ReactNode }) {
  const [lastExecution, setLastExecution] = useState<LastExecution | null>(null);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [currentWorkflowTitle, setCurrentWorkflowTitle] = useState("Untitled Workflow");

  return (
    <FlowStateContext.Provider
      value={{
        lastExecution,
        setLastExecution,
        workflowResult,
        setWorkflowResult,
        showResultPanel,
        setShowResultPanel,
        currentWorkflowTitle,
        setCurrentWorkflowTitle,
      }}
    >
      {children}
    </FlowStateContext.Provider>
  );
}

export const useFlowState = () => useContext(FlowStateContext);
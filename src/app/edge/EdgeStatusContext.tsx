import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { EdgeAiEngine } from "./EdgeAiEngine";
import { MockRuntime } from "./MockRuntime";

interface EdgeStatus {
  engine: EdgeAiEngine | null;
  ready: boolean;
  mode: "mock" | "local-model";
  lastError?: string;
}

const EdgeStatusContext = createContext<EdgeStatus>({
  engine: null,
  ready: false,
  mode: "mock",
});

export function EdgeStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EdgeStatus>({
    engine: null,
    ready: false,
    mode: "mock",
  });

  useEffect(() => {
    const runtime = new MockRuntime();
    const engine = new EdgeAiEngine(runtime);

    engine
      .warmup()
      .then(() => {
        setState({ engine, ready: true, mode: "mock" });
      })
      .catch((err) => {
        setState({ engine: null, ready: false, mode: "mock", lastError: String(err) });
      });
  }, []);

  return (
    <EdgeStatusContext.Provider value={state}>
      {children}
    </EdgeStatusContext.Provider>
  );
}

export function useEdgeStatus() {
  return useContext(EdgeStatusContext);
}

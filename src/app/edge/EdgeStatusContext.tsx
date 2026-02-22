import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { EdgeAiEngine } from "./EdgeAiEngine";
import { MockRuntime } from "./MockRuntime";
import type { EdgeRuntimeType } from "./TFLiteRuntime";

interface EdgeStatus {
  engine: EdgeAiEngine | null;
  ready: boolean;
  mode: "mock" | "tflite";
  warmupTimeMs: number;
  cacheHits: number;
  cacheMisses: number;
  cacheSize: number;
  lastError?: string;
  switchRuntime: (type: EdgeRuntimeType) => Promise<void>;
  refreshStats: () => void;
}

const EdgeStatusContext = createContext<EdgeStatus>({
  engine: null,
  ready: false,
  mode: "mock",
  warmupTimeMs: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheSize: 0,
  switchRuntime: async () => {},
  refreshStats: () => {},
});

export function EdgeStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<EdgeStatus, "switchRuntime" | "refreshStats">>({
    engine: null,
    ready: false,
    mode: "mock",
    warmupTimeMs: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheSize: 0,
  });

  const initRuntime = useCallback(async (type: EdgeRuntimeType) => {
    setState((prev) => ({ ...prev, ready: false, lastError: undefined }));

    try {
      let runtime;
      if (type === "tflite") {
        const { TFLiteRuntime } = await import("./TFLiteRuntime");
        runtime = new TFLiteRuntime();
      } else {
        runtime = new MockRuntime();
      }

      const engine = new EdgeAiEngine(runtime);
      await engine.warmup();

      setState({
        engine,
        ready: true,
        mode: type,
        warmupTimeMs: engine.warmupTimeMs,
        cacheHits: engine.cacheHits,
        cacheMisses: engine.cacheMisses,
        cacheSize: engine.cacheSize,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        engine: null,
        ready: false,
        lastError: String(err),
      }));
    }
  }, []);

  useEffect(() => {
    initRuntime("mock");
  }, [initRuntime]);

  const switchRuntime = useCallback(
    async (type: EdgeRuntimeType) => {
      await initRuntime(type);
    },
    [initRuntime]
  );

  const refreshStats = useCallback(() => {
    if (state.engine) {
      setState((prev) => ({
        ...prev,
        cacheHits: prev.engine?.cacheHits ?? 0,
        cacheMisses: prev.engine?.cacheMisses ?? 0,
        cacheSize: prev.engine?.cacheSize ?? 0,
      }));
    }
  }, [state.engine]);

  return (
    <EdgeStatusContext.Provider value={{ ...state, switchRuntime, refreshStats }}>
      {children}
    </EdgeStatusContext.Provider>
  );
}

export function useEdgeStatus() {
  return useContext(EdgeStatusContext);
}

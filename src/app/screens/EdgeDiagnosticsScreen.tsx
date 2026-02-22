import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import { ArrowLeft, Cpu, CheckCircle, XCircle, Activity, Clock, Zap, BarChart3, Database, RefreshCw } from "lucide-react";

export function EdgeDiagnosticsScreen() {
  const navigate = useNavigate();
  const { engine, ready, mode, warmupTimeMs, cacheHits, cacheMisses, cacheSize, lastError, switchRuntime, refreshStats } = useEdgeStatus();
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [switchingRuntime, setSwitchingRuntime] = useState(false);

  useEffect(() => {
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, [refreshStats]);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    inferenceMs: number;
    summaryMs: number;
  } | null>(null);

  const provenance = engine?.getModelProvenance();

  const handleBenchmark = async () => {
    if (!engine) return;
    setBenchmarkRunning(true);
    setBenchmarkResult(null);

    try {
      const dummyFeatures = new Float32Array(8).fill(0.7);
      const start1 = performance.now();
      await engine.runScreeningInference({
        id: "benchmark",
        childId: "benchmark",
        createdAt: new Date().toISOString(),
        ageMonths: 24,
        domains: [],
        parentConcernsText: "",
        media: [],
        status: "draft",
      });
      const inferenceMs = performance.now() - start1;

      const start2 = performance.now();
      await engine.generateSummaries(
        {
          id: "benchmark",
          childId: "benchmark",
          createdAt: new Date().toISOString(),
          ageMonths: 24,
          domains: [],
          parentConcernsText: "",
          media: [],
          status: "draft",
        },
        {
          sessionId: "benchmark",
          overallRisk: "on_track",
          overallScore: 0.8,
          domainRisks: [],
          keyFindings: [],
          strengths: [],
          watchAreas: [],
        }
      );
      const summaryMs = performance.now() - start2;

      setBenchmarkResult({ inferenceMs, summaryMs });
      refreshStats();
    } catch {
      setBenchmarkResult(null);
    } finally {
      setBenchmarkRunning(false);
    }
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Edge AI Diagnostics</h1>
            <p className="text-sm text-[#666666]">On-device model status</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-gradient-to-br from-[#E8F0FE] to-[#D2E3FC] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#1A73E8]" />
              </div>
              <div>
                <h2 className="font-bold text-[#1A1A1A]">Edge AI Engine</h2>
                <p className="text-sm text-[#666666]">HAI-DEF / MedGemma Runtime</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ready ? (
                <>
                  <CheckCircle className="w-5 h-5 text-[#34A853]" />
                  <span className="font-semibold text-[#34A853]">Ready</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-[#EA4335]" />
                  <span className="font-semibold text-[#EA4335]">Not Ready</span>
                </>
              )}
            </div>
            {lastError && (
              <p className="text-sm text-[#EA4335] mt-2">{lastError}</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">Model Information</h3>
            <div className="bg-white border-2 border-gray-100 rounded-2xl divide-y divide-gray-100">
              <InfoRow icon={<Activity className="w-4 h-4" />} label="Runtime Mode" value={mode === "mock" ? "Demo (Mock)" : "TFLite INT4"} />
              <InfoRow icon={<Cpu className="w-4 h-4" />} label="Model ID" value={provenance?.modelId || "—"} />
              <InfoRow icon={<Zap className="w-4 h-4" />} label="Version" value={provenance?.version || "—"} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Warmup Time" value={warmupTimeMs > 0 ? `${warmupTimeMs.toFixed(0)}ms` : "—"} />
              <InfoRow icon={<BarChart3 className="w-4 h-4" />} label="Inference Count" value={engine ? String(engine.inferenceCount) : "0"} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Inference" value={engine && engine.lastInferenceTimeMs > 0 ? `${engine.lastInferenceTimeMs.toFixed(0)}ms` : "—"} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Summary" value={engine && engine.lastSummaryTimeMs > 0 ? `${engine.lastSummaryTimeMs.toFixed(0)}ms` : "—"} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">Inference Cache</h3>
            <div className="bg-white border-2 border-gray-100 rounded-2xl divide-y divide-gray-100">
              <InfoRow icon={<Database className="w-4 h-4" />} label="Cache Size" value={`${cacheSize} entries`} />
              <InfoRow icon={<CheckCircle className="w-4 h-4" />} label="Cache Hits" value={String(cacheHits)} />
              <InfoRow icon={<XCircle className="w-4 h-4" />} label="Cache Misses" value={String(cacheMisses)} />
              <InfoRow
                icon={<BarChart3 className="w-4 h-4" />}
                label="Hit Rate"
                value={
                  cacheHits + cacheMisses > 0
                    ? `${((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(0)}%`
                    : "—"
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">Runtime Selection</h3>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setSwitchingRuntime(true);
                  await switchRuntime("mock");
                  setSwitchingRuntime(false);
                }}
                disabled={switchingRuntime || mode === "mock"}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  mode === "mock"
                    ? "bg-[#1A73E8] text-white"
                    : "bg-gray-100 text-[#666666] hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                Mock Runtime
              </button>
              <button
                onClick={async () => {
                  setSwitchingRuntime(true);
                  await switchRuntime("tflite");
                  setSwitchingRuntime(false);
                }}
                disabled={switchingRuntime || mode === "tflite"}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  mode === "tflite"
                    ? "bg-[#34A853] text-white"
                    : "bg-gray-100 text-[#666666] hover:bg-gray-200"
                } disabled:opacity-50`}
              >
                {switchingRuntime ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "TFLite Runtime"
                )}
              </button>
            </div>
            {mode === "tflite" && (
              <div className="bg-[#E6F4EA] rounded-xl p-3">
                <p className="text-xs text-[#34A853] font-semibold">TFLite INT4 Active</p>
                <p className="text-xs text-[#137333] mt-1">
                  On-device inference via MedGemma-2B-IT-Q4. Production path: ONNX Runtime Web + WebAssembly for browser, LiteRT + NNAPI for Android, CoreML for iOS.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#1A1A1A]">Benchmark</h3>
            <button
              onClick={handleBenchmark}
              disabled={!ready || benchmarkRunning}
              className="w-full py-3 px-4 bg-[#1A73E8] text-white font-semibold rounded-xl disabled:opacity-50 transition-colors hover:bg-[#1557B0]"
            >
              {benchmarkRunning ? "Running benchmark..." : "Run Benchmark"}
            </button>
            {benchmarkResult && (
              <div className="bg-[#E6F4EA] rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-[#34A853]">Benchmark Complete</p>
                <p className="text-sm text-[#1A1A1A]">Risk Inference: <strong>{benchmarkResult.inferenceMs.toFixed(0)}ms</strong></p>
                <p className="text-sm text-[#1A1A1A]">Summary Generation: <strong>{benchmarkResult.summaryMs.toFixed(0)}ms</strong></p>
                <p className="text-sm text-[#1A1A1A]">Total: <strong>{(benchmarkResult.inferenceMs + benchmarkResult.summaryMs).toFixed(0)}ms</strong></p>
              </div>
            )}
          </div>

          <div className="bg-[#FFF3E0] rounded-2xl p-4">
            <p className="text-sm text-[#E65100] font-semibold mb-1">About Edge AI</p>
            <p className="text-sm text-[#E65100]">
              PediScreen AI uses on-device inference for developmental screening risk assessment.
              In demo mode, a mock runtime simulates the HAI-DEF / MedGemma model pipeline.
              When a real model is deployed, inference runs entirely on your device — no cloud required.
            </p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-[#666666]">{icon}</span>
      <span className="text-sm text-[#666666] flex-1">{label}</span>
      <span className="text-sm font-semibold text-[#1A1A1A]">{value}</span>
    </div>
  );
}

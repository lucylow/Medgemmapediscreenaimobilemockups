import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import {
  MEDGEMMA_CAPABILITIES,
  MEDGEMMA_MODELS,
  DEPLOYMENT_STRATEGY,
  PERFORMANCE_BENCHMARKS,
  formatModelSize,
  getTotalModelSize,
  type MedGemmaModel,
} from "../edge/MedGemmaRegistry";
import {
  ArrowLeft, Cpu, Download, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Zap, Server, Smartphone, Globe, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticSelection, hapticImpact } from "../platform/haptics";

const statusConfig = {
  loaded: { label: "Loaded", color: "#34A853", icon: CheckCircle },
  available: { label: "Available", color: "#1A73E8", icon: Download },
  downloading: { label: "Downloading", color: "#FF9800", icon: AlertCircle },
  unavailable: { label: "Unavailable", color: "#999999", icon: AlertCircle },
};

const targetIcons: Record<string, typeof Globe> = {
  web: Globe,
  ios: Smartphone,
  android: Smartphone,
  "edge-tpu": Server,
};

function ModelCard({ model, onSimulate }: { model: MedGemmaModel; onSimulate: (m: MedGemmaModel) => void }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[model.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => { hapticSelection(); setExpanded(!expanded); }}
        className="w-full p-4 flex items-start gap-3 active:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center flex-shrink-0">
          <Cpu className="w-5 h-5 text-[#1A73E8]" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] truncate">{model.name}</p>
          <p className="text-xs text-[#999999]">v{model.version} &bull; {formatModelSize(model.sizeBytes)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: status.color + "15", color: status.color }}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#CCC]" /> : <ChevronDown className="w-4 h-4 text-[#CCC]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
              <p className="text-xs text-[#666666] leading-relaxed">{model.description}</p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#F8F9FA] rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-[#1A73E8]">{model.latencyMs.avg}ms</p>
                  <p className="text-[10px] text-[#999999] uppercase">Avg Latency</p>
                </div>
                <div className="bg-[#F8F9FA] rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-[#34A853]">{(model.accuracy * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-[#999999] uppercase">Accuracy</p>
                </div>
                <div className="bg-[#F8F9FA] rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-[#FF9800]">{model.format}</p>
                  <p className="text-[10px] text-[#999999] uppercase">Format</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[#999999] uppercase font-semibold mb-1.5">Input/Output</p>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono bg-gray-100 text-[#666666] px-2 py-1 rounded">
                    in: [{model.inputShape.join(", ")}]
                  </span>
                  <span className="text-[10px] font-mono bg-gray-100 text-[#666666] px-2 py-1 rounded">
                    out: [{model.outputShape.join(", ")}]
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[#999999] uppercase font-semibold mb-1.5">Deploy Targets</p>
                <div className="flex gap-1.5">
                  {model.targets.map((target) => {
                    const TargetIcon = targetIcons[target] || Globe;
                    return (
                      <span key={target} className="flex items-center gap-1 text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] px-2 py-1 rounded-lg">
                        <TargetIcon className="w-3 h-3" />
                        {target}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#F0F7FF] rounded-xl p-2.5">
                <div className="flex items-start gap-1.5">
                  <Shield className="w-3 h-3 text-[#34A853] mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-[#666666] leading-relaxed">{model.clinicalValidation}</p>
                </div>
              </div>

              {model.status === "loaded" && (
                <button
                  onClick={() => { hapticImpact("medium"); onSimulate(model); }}
                  className="w-full py-2.5 bg-[#1A73E8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Run Benchmark
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MedGemmaModelsScreen() {
  const navigate = useNavigate();
  const { engine, ready } = useEdgeStatus();
  const [benchmarkResult, setBenchmarkResult] = useState<{ modelId: string; latencyMs: number } | null>(null);

  const handleSimulate = async (model: MedGemmaModel) => {
    if (!engine || !ready) return;
    const start = performance.now();
    try {
      if (model.type === "screening") {
        await engine.runScreeningInference({
          id: "bench", childId: "bench", createdAt: new Date().toISOString(),
          ageMonths: 24, domains: [], parentConcernsText: "", media: [], status: "draft",
        });
      } else if (model.type === "vocal") {
        await engine.runVocalAnalysis({
          audioSamples: new Float32Array(16000),
          sampleRate: 16000, durationMs: 1000, childAgeMonths: 12,
        });
      } else if (model.type === "pose") {
        await engine.runPoseEstimation({
          frameData: null, width: 192, height: 192, childAgeMonths: 12,
        });
      } else if (model.type === "xray") {
        await engine.runXrayAnalysis({
          imageData: null, childAgeMonths: 24,
        });
      } else if (model.type === "fusion") {
        await engine.runFusion({ childAgeMonths: 24 });
      }
    } catch {}
    setBenchmarkResult({ modelId: model.id, latencyMs: Math.round(performance.now() - start) });
  };

  const loadedCount = MEDGEMMA_MODELS.filter((m) => m.status === "loaded").length;
  const capabilities = engine?.getCapabilities();

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">MedGemma Models</h1>
            <p className="text-xs text-[#666666]">{MEDGEMMA_MODELS.length} models &bull; {formatModelSize(getTotalModelSize())}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="bg-gradient-to-r from-[#1A73E8] to-[#0D47A1] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5" />
              <p className="font-bold">HAI-DEF MedGemma Stack</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{MEDGEMMA_MODELS.length}</p>
                <p className="text-[10px] text-white/70 uppercase">Models</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{loadedCount}/{MEDGEMMA_MODELS.length}</p>
                <p className="text-[10px] text-white/70 uppercase">Active</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{engine?.totalInferenceCount ?? 0}</p>
                <p className="text-[10px] text-white/70 uppercase">Inferences</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{ready ? "ON" : "OFF"}</p>
                <p className="text-[10px] text-white/70 uppercase">Engine</p>
              </div>
            </div>
          </div>

          {capabilities && (
            <div className="grid grid-cols-5 gap-1.5">
              {(["screening", "vocal", "pose", "xray", "fusion"] as const).map((cap) => {
                const active = capabilities[cap];
                const labels = { screening: "Screen", vocal: "Voice", pose: "Pose", xray: "X-ray", fusion: "Fuse" };
                const icons = { screening: "🧠", vocal: "🎤", pose: "🏃", xray: "🦴", fusion: "🔗" };
                return (
                  <div
                    key={cap}
                    className={`rounded-xl p-2.5 text-center border-2 ${
                      active ? "border-[#34A853] bg-[#E8F5E8]" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-lg">{icons[cap]}</p>
                    <p className="text-[10px] font-bold text-[#1A1A1A]">{labels[cap]}</p>
                    <p className={`text-[9px] font-semibold ${active ? "text-[#34A853]" : "text-[#999999]"}`}>
                      {active ? "Ready" : "N/A"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {benchmarkResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#E8F5E8] border border-[#C8E6C9] rounded-xl p-3 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-[#34A853]" />
              <p className="text-xs text-[#2E7D32]">
                <span className="font-bold">{benchmarkResult.modelId}</span> — {benchmarkResult.latencyMs}ms
              </p>
            </motion.div>
          )}

          {MEDGEMMA_CAPABILITIES.map((capability) => (
            <div key={capability.type}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{capability.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{capability.label}</p>
                  <p className="text-[10px] text-[#999999]">{capability.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                {capability.models.map((model) => (
                  <ModelCard key={model.id} model={model} onSimulate={handleSimulate} />
                ))}
              </div>
            </div>
          ))}

          <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-[#1A1A1A] uppercase">Deployment Strategy</p>
            {Object.entries(DEPLOYMENT_STRATEGY).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-[#1A73E8] uppercase w-16 flex-shrink-0 mt-0.5">{key}</span>
                <p className="text-[10px] text-[#666666]">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-[#1A1A1A] uppercase">Performance Benchmarks</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-[#999999] uppercase">
                    <th className="text-left py-1 pr-2">Device</th>
                    <th className="text-right py-1 px-1">Screen</th>
                    <th className="text-right py-1 px-1">Vocal</th>
                    <th className="text-right py-1 px-1">Pose</th>
                    <th className="text-right py-1 px-1">X-ray</th>
                    <th className="text-right py-1 pl-1">Fusion</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PERFORMANCE_BENCHMARKS).map(([device, benchmarks]) => (
                    <tr key={device} className="border-t border-gray-100">
                      <td className="py-1.5 pr-2 font-semibold text-[#1A1A1A]">{device}</td>
                      <td className="py-1.5 px-1 text-right text-[#666666]">{benchmarks.screening}ms</td>
                      <td className="py-1.5 px-1 text-right text-[#666666]">{benchmarks.vocal ?? "—"}ms</td>
                      <td className="py-1.5 px-1 text-right text-[#666666]">{benchmarks.pose}ms</td>
                      <td className="py-1.5 px-1 text-right text-[#666666]">{"xray" in benchmarks ? (benchmarks as Record<string, number | null>).xray ?? "—" : "—"}ms</td>
                      <td className="py-1.5 pl-1 text-right text-[#666666]">{benchmarks.fusion ?? "—"}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-xs text-[#999999] space-y-0.5 pb-4">
            <p>MedGemma PediScreen AI &bull; Edge Runtime</p>
            <p>Models run on-device — no cloud dependencies</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft, Download, FileText, ChevronDown, ChevronUp,
  AlertTriangle, Layers, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact } from "../platform/haptics";
import type { CTVolume, CTInferenceResult, CTSeriesEntry } from "../ct/ctTypes";
import { CT_RISK_COLORS, CT_RISK_LABELS, CT_MODALITY_LABELS } from "../ct/ctTypes";
import { getSlice, getSliceDimensions, type SliceView } from "../ct/ctPreprocess";
import { buildCTFhirBundle, downloadFhirBundle } from "../ct/fhirExporter";

const VIEW_LABELS: Record<SliceView, string> = {
  axial: "Axial",
  coronal: "Coronal",
  sagittal: "Sagittal",
};

export function CT3DViewerScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { volume, result } = (location.state ?? {}) as {
    volume?: CTVolume;
    result?: CTInferenceResult;
  };

  const [activeView, setActiveView] = useState<SliceView>("axial");
  const [sliceIndex, setSliceIndex] = useState(32);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [showFindings, setShowFindings] = useState(true);
  const [showFhir, setShowFhir] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSlice = useCallback(() => {
    if (!volume || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sliceData = getSlice(volume, activeView, sliceIndex, brightness, contrast);
    canvas.width = sliceData.width;
    canvas.height = sliceData.height;

    const pixelsCopy = new Uint8ClampedArray(sliceData.pixels.length);
    pixelsCopy.set(sliceData.pixels);
    const imageData = ctx.createImageData(sliceData.width, sliceData.height);
    imageData.data.set(pixelsCopy);
    ctx.putImageData(imageData, 0, 0);
  }, [volume, activeView, sliceIndex, brightness, contrast]);

  useEffect(() => {
    drawSlice();
  }, [drawSlice]);

  useEffect(() => {
    if (volume) {
      const dims = getSliceDimensions(volume, activeView);
      setSliceIndex(Math.floor(dims.maxIndex / 2));
    }
  }, [activeView, volume]);

  if (!volume || !result) {
    return (
      <MobileContainer>
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-[#999] mx-auto mb-3" />
            <p className="text-[#666] font-medium">No CT data available</p>
            <button
              onClick={() => navigate("/ct-import")}
              className="mt-4 text-[#00838F] font-medium text-sm"
            >
              Go to Import
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const dims = getSliceDimensions(volume, activeView);
  const fhirData = buildCTFhirBundle(volume.meta, result);

  const handleSaveSeries = () => {
    const entry: CTSeriesEntry = {
      id: volume.meta.id,
      timestamp: Date.now(),
      modality: volume.meta.modality,
      sliceCount: volume.meta.sliceCount,
      riskTier: result.riskTier,
      domainScores: result.domainScores,
      latencyMs: result.latencyMs,
      keyFindings: result.keyFindings,
    };

    const existing = JSON.parse(localStorage.getItem("ct_series_history") ?? "[]");
    existing.push(entry);
    localStorage.setItem("ct_series_history", JSON.stringify(existing));
    hapticImpact("medium");
  };

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#263238] to-[#37474F] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">3D CT Viewer</h1>
              <p className="text-xs text-white/60">
                {CT_MODALITY_LABELS[volume.meta.modality]} · {volume.meta.rows}x{volume.meta.cols}x{volume.meta.sliceCount}
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${CT_RISK_COLORS[result.riskTier]}20`,
              color: CT_RISK_COLORS[result.riskTier],
            }}
          >
            {CT_RISK_LABELS[result.riskTier]}
          </div>
        </div>

        <div className="px-4 mb-3">
          <div
            className="rounded-2xl p-3 flex items-center justify-between"
            style={{ backgroundColor: `${CT_RISK_COLORS[result.riskTier]}15` }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {result.riskTier === "ON_TRACK" ? "✅" : result.riskTier === "MONITOR" ? "⚠️" : result.riskTier === "REFER" ? "🚩" : "🚨"}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  CT Risk: {CT_RISK_LABELS[result.riskTier]}
                </p>
                <p className="text-xs text-white/60">
                  Hemorrhage {(result.domainScores.hemorrhageRisk * 100).toFixed(0)}% ·
                  Fracture {(result.domainScores.fractureRisk * 100).toFixed(0)}% ·
                  NEC {(result.domainScores.necRisk * 100).toFixed(0)}% ·
                  Tumor {(result.domainScores.tumorBurden * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-white/40">
              {(result.latencyMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="flex gap-2">
            {(["axial", "coronal", "sagittal"] as SliceView[]).map((view) => (
              <button
                key={view}
                onClick={() => { setActiveView(view); hapticImpact("light"); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeView === view
                    ? "bg-[#00838F] text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {VIEW_LABELS[view]}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="bg-black rounded-2xl overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ imageRendering: "pixelated", aspectRatio: `${dims.width}/${dims.height}` }}
            />
            <div className="absolute top-2 left-2 bg-black/60 rounded-lg px-2 py-1">
              <p className="text-xs text-white/80 font-mono">
                {VIEW_LABELS[activeView]} {sliceIndex + 1}/{dims.maxIndex + 1}
              </p>
            </div>
            <div className="absolute top-2 right-2 bg-black/60 rounded-lg px-2 py-1">
              <p className="text-xs text-white/80 font-mono">
                {dims.width}x{dims.height}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60 font-medium">Slice</span>
              <span className="text-xs text-white/40 font-mono">{sliceIndex + 1}/{dims.maxIndex + 1}</span>
            </div>
            <input
              type="range"
              min={0}
              max={dims.maxIndex}
              value={sliceIndex}
              onChange={(e) => setSliceIndex(parseInt(e.target.value))}
              className="w-full accent-[#26C6DA]"
            />
          </div>

          <div className="bg-white/10 rounded-2xl p-4 grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-white/60 font-medium block mb-1">Brightness</span>
              <input
                type="range"
                min={-50}
                max={50}
                value={brightness * 100}
                onChange={(e) => setBrightness(parseInt(e.target.value) / 100)}
                className="w-full accent-[#26C6DA]"
              />
            </div>
            <div>
              <span className="text-xs text-white/60 font-medium block mb-1">Contrast</span>
              <input
                type="range"
                min={50}
                max={200}
                value={contrast * 100}
                onChange={(e) => setContrast(parseInt(e.target.value) / 100)}
                className="w-full accent-[#26C6DA]"
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Domain Scores</h3>
            {Object.entries(result.domainScores).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
              const pct = (value as number) * 100;
              return (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{label}</span>
                    <span className="text-white/50">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct > 60 ? "#EA4335" : pct > 40 ? "#F9AB00" : "#34A853",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {result.useCaseFlags && result.useCaseFlags.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Use Case Flags</h3>
              <div className="space-y-2">
                {result.useCaseFlags.map((flag) => (
                  <div
                    key={flag.code}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl ${
                      flag.triggered ? "bg-red-900/30" : "bg-white/5"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${flag.triggered ? "text-red-300" : "text-white/60"}`}>
                        {flag.useCase}
                      </p>
                      <p className="text-xs text-white/40">{flag.code}</p>
                    </div>
                    <span className={`text-sm font-bold ${flag.triggered ? "text-red-400" : "text-white/40"}`}>
                      {(flag.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowFindings(!showFindings)}
            className="w-full bg-white/10 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Clinical Summary & Findings</h3>
              {showFindings ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </div>
            <AnimatePresence>
              {showFindings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-white/60 mt-3 leading-relaxed">{result.clinicalSummary}</p>
                  <div className="mt-3 space-y-1">
                    {result.keyFindings.map((f, i) => (
                      <p key={i} className="text-xs text-white/70">• {f}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                handleSaveSeries();
              }}
              className="flex-1 bg-white/10 rounded-2xl p-3 text-center"
            >
              <Layers className="w-5 h-5 text-white/60 mx-auto mb-1" />
              <span className="text-xs text-white/60 font-medium">Save to Series</span>
            </button>
            <button
              onClick={() => setShowFhir(!showFhir)}
              className="flex-1 bg-white/10 rounded-2xl p-3 text-center"
            >
              <FileText className="w-5 h-5 text-white/60 mx-auto mb-1" />
              <span className="text-xs text-white/60 font-medium">FHIR Preview</span>
            </button>
            <button
              onClick={() => downloadFhirBundle(fhirData.json)}
              className="flex-1 bg-white/10 rounded-2xl p-3 text-center"
            >
              <Download className="w-5 h-5 text-white/60 mx-auto mb-1" />
              <span className="text-xs text-white/60 font-medium">Export FHIR</span>
            </button>
          </div>

          <AnimatePresence>
            {showFhir && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">FHIR R4 Bundle</h3>
                  <pre className="text-xs text-white/50 font-mono whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                    {fhirData.json}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-white/30 mt-6 px-4">
          MedGemma CT {result.modelVersion} · Not a diagnostic tool · Requires radiologist review
        </p>
      </div>
    </MobileContainer>
  );
}

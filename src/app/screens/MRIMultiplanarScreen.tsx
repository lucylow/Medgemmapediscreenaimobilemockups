import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft, Download, FileText, ChevronDown, ChevronUp,
  AlertTriangle, Layers, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact } from "../platform/haptics";
import type { MRIVolume, MRIInferenceResult, MRISeriesEntry } from "../mri/mriTypes";
import { MRI_RISK_COLORS, MRI_RISK_LABELS, MRI_SCAN_LABELS } from "../mri/mriTypes";
import { getMRISlice, getMRISliceDimensions, type SliceView } from "../mri/mriPreprocess";
import { buildMRIFhirBundle, downloadMRIFhirBundle } from "../mri/mriFhirExporter";

const VIEW_LABELS: Record<SliceView, string> = {
  axial: "Axial",
  coronal: "Coronal",
  sagittal: "Sagittal",
};

const DOMAIN_DISPLAY: { key: keyof MRIInferenceResult["domainScores"]; label: string; unit: string; format: (v: number) => string; colorFn: (v: number, k: string) => string }[] = [
  {
    key: "brainAgeGapMonths",
    label: "Brain Age Gap",
    unit: "months",
    format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`,
    colorFn: (v) => Math.abs(v) > 4 ? "#EA4335" : Math.abs(v) > 2 ? "#F9AB00" : "#34A853",
  },
  {
    key: "corticalThickness",
    label: "Cortical Thickness",
    unit: "mm",
    format: (v) => v.toFixed(1),
    colorFn: (v) => v < 1.8 ? "#EA4335" : v < 2.2 ? "#F9AB00" : "#34A853",
  },
  {
    key: "whiteMatterIntegrity",
    label: "White Matter FA",
    unit: "",
    format: (v) => v.toFixed(2),
    colorFn: (v) => v < 0.65 ? "#EA4335" : v < 0.8 ? "#F9AB00" : "#34A853",
  },
  {
    key: "ventricularRatio",
    label: "Ventricular Ratio",
    unit: "%",
    format: (v) => `${(v * 100).toFixed(0)}`,
    colorFn: (v) => v > 0.25 ? "#EA4335" : v > 0.18 ? "#F9AB00" : "#34A853",
  },
  {
    key: "myelinationScore",
    label: "Myelination",
    unit: "%",
    format: (v) => `${(v * 100).toFixed(0)}`,
    colorFn: (v) => v < 0.65 ? "#EA4335" : v < 0.8 ? "#F9AB00" : "#34A853",
  },
];

export function MRIMultiplanarScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { volume, result } = (location.state ?? {}) as {
    volume?: MRIVolume;
    result?: MRIInferenceResult;
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

    const sliceData = getMRISlice(volume, activeView, sliceIndex, brightness, contrast);
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
      const dims = getMRISliceDimensions(volume, activeView);
      setSliceIndex(Math.floor(dims.maxIndex / 2));
    }
  }, [activeView, volume]);

  if (!volume || !result) {
    return (
      <MobileContainer>
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-[#999] mx-auto mb-3" />
            <p className="text-[#666] font-medium">No MRI data available</p>
            <button
              onClick={() => navigate("/mri-import")}
              className="mt-4 text-[#1565C0] font-medium text-sm"
            >
              Go to Import
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const dims = getMRISliceDimensions(volume, activeView);
  const fhirData = buildMRIFhirBundle(volume.meta, result);

  const handleSaveSeries = () => {
    const entry: MRISeriesEntry = {
      id: volume.meta.id,
      timestamp: Date.now(),
      modality: volume.meta.modality,
      sliceCount: volume.meta.sliceCount,
      patientAgeMonths: volume.meta.patientAgeMonths,
      riskAmplification: result.riskAmplification,
      domainScores: result.domainScores,
      brainAgeEquivalent: result.brainAgeEquivalent,
      latencyMs: result.latencyMs,
      keyFindings: result.keyFindings,
    };

    const existing = JSON.parse(localStorage.getItem("mri_series_history") ?? "[]");
    existing.push(entry);
    localStorage.setItem("mri_series_history", JSON.stringify(existing));
    hapticImpact("medium");
  };

  const brainAgeGap = result.domainScores.brainAgeGapMonths;
  const isDelayed = brainAgeGap > 0;
  const gaugeColor = Math.abs(brainAgeGap) > 4 ? "#d93025" : Math.abs(brainAgeGap) > 2 ? "#F9AB00" : "#137333";

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#1A237E] to-[#283593] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">MRI Brain Viewer</h1>
              <p className="text-xs text-white/60">
                {MRI_SCAN_LABELS[volume.meta.modality]} · {volume.meta.rows}x{volume.meta.cols}x{volume.meta.sliceCount} · {volume.meta.patientAgeMonths}mo
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              backgroundColor: `${MRI_RISK_COLORS[result.riskAmplification]}20`,
              color: MRI_RISK_COLORS[result.riskAmplification],
            }}
          >
            {MRI_RISK_LABELS[result.riskAmplification]}
          </div>
        </div>

        <div className="px-4 mb-3">
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-3xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Brain Age Deviation</p>
                <p className="text-3xl font-black mt-1" style={{ color: gaugeColor }}>
                  {brainAgeGap > 0 ? "+" : ""}{brainAgeGap.toFixed(1)}m
                </p>
                <p className="text-sm font-semibold text-white/80">
                  {isDelayed ? "Delayed" : brainAgeGap < -0.5 ? "Advanced" : "On Track"}
                </p>
              </div>
              <div className="text-right">
                <Brain className="w-10 h-10 text-white/20 mb-1" />
                <p className="text-xs text-white/50">
                  Chrono: {volume.meta.patientAgeMonths}m
                </p>
                <p className="text-xs text-white/50">
                  Brain: {result.brainAgeEquivalent.toFixed(1)}m
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-full h-2.5">
                <div
                  className="rounded-full h-2.5 transition-all"
                  style={{
                    width: `${Math.min(100, Math.abs(brainAgeGap) * 12)}%`,
                    backgroundColor: gaugeColor,
                  }}
                />
              </div>
              <p className="text-xs text-white/40">Normal: ±2m</p>
            </div>
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
                    ? "bg-[#1565C0] text-white"
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
                {dims.width}x{dims.height} · TR={volume.meta.TR}ms
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
              className="w-full accent-[#42A5F5]"
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
                className="w-full accent-[#42A5F5]"
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
                className="w-full accent-[#42A5F5]"
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Domain Scores</h3>
            {DOMAIN_DISPLAY.map((d) => {
              const value = result.domainScores[d.key];
              const color = d.colorFn(value, d.key);
              return (
                <div key={d.key} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{d.label}</span>
                    <span className="font-bold" style={{ color }}>
                      {d.format(value)}{d.unit && ` ${d.unit}`}
                    </span>
                  </div>
                  {d.key !== "brainAgeGapMonths" && (
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (d.key === "ventricularRatio" ? value * 100 * 3 : value * 100))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Scan Parameters</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-white/40">TR</p>
                <p className="text-white/80 font-medium">{volume.meta.TR}ms</p>
              </div>
              <div>
                <p className="text-white/40">TE</p>
                <p className="text-white/80 font-medium">{volume.meta.TE}ms</p>
              </div>
              <div>
                <p className="text-white/40">Motion</p>
                <p className="text-white/80 font-medium">{((volume.meta.motionScore ?? 0) * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-white/40">Voxel</p>
                <p className="text-white/80 font-medium">{volume.meta.voxelSpacing.join("x")}mm</p>
              </div>
              <div>
                <p className="text-white/40">Latency</p>
                <p className="text-white/80 font-medium">{(result.latencyMs / 1000).toFixed(1)}s</p>
              </div>
              <div>
                <p className="text-white/40">Sequence</p>
                <p className="text-white/80 font-medium">{volume.meta.modality.replace("_", " ")}</p>
              </div>
            </div>
          </div>

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
              onClick={handleSaveSeries}
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
              onClick={() => downloadMRIFhirBundle(fhirData.json)}
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
          MedGemma MRI {result.modelVersion} · Not a diagnostic tool · Requires neuroradiologist review
        </p>
      </div>
    </MobileContainer>
  );
}

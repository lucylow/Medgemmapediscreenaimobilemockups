import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import { useApp } from "../context/AppContext";
import type { XrayAnalysisResult, XraySeriesEntry } from "../edge/medgemmaSchemas";
import {
  ArrowLeft, Bone, Camera, AlertTriangle, TrendingUp,
  Clock, Shield, ChevronDown, ChevronUp, FileText, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";

const maturityColors = {
  delayed: { bg: "#FFF3E0", border: "#FF9800", text: "#E65100", label: "Delayed" },
  normal: { bg: "#E8F5E9", border: "#4CAF50", text: "#2E7D32", label: "Normal" },
  advanced: { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0", label: "Advanced" },
};

const fractureColors = {
  none: "#4CAF50",
  low: "#8BC34A",
  moderate: "#FF9800",
  high: "#F44336",
};

export function XrayAnalysisScreen() {
  const navigate = useNavigate();
  const { engine, ready } = useEdgeStatus();
  const { children } = useApp();

  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState(24);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<XrayAnalysisResult | null>(null);
  const [seriesHistory, setSeriesHistory] = useState<XraySeriesEntry[]>([]);
  const [showClinical, setShowClinical] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!engine || !ready) return;
    hapticImpact("heavy");
    setIsAnalyzing(true);
    setResult(null);

    try {
      const xrayResult = await engine.runXrayAnalysis({
        imageData: null,
        childAgeMonths: selectedAge,
        studyId: `xray_${Date.now()}`,
      });

      if (xrayResult) {
        setResult(xrayResult);
        hapticNotification("success");

        setSeriesHistory((prev) => [
          ...prev,
          {
            id: xrayResult.sessionId,
            timestamp: Date.now(),
            boneAgeMonths: xrayResult.boneAgeMonths,
            chronologicalAgeMonths: xrayResult.chronologicalAgeMonths,
            boneAgeZScore: xrayResult.boneAgeZScore,
            skeletalMaturity: xrayResult.skeletalMaturity,
            growthVelocityCmYear: xrayResult.growthVelocityCmYear,
          },
        ]);
      }
    } catch (err) {
      hapticNotification("error");
    } finally {
      setIsAnalyzing(false);
    }
  }, [engine, ready, selectedAge]);

  const ageOptions = [6, 12, 18, 24, 30, 36, 48, 60];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Bone Age X-ray</h1>
            <p className="text-xs text-[#666666]">Greulich-Pyle Assessment</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-2xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F57F17] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[#5D4037] leading-relaxed">
              This is a simulated bone age analysis for demonstration purposes. In clinical use, hand/wrist X-ray images would be analyzed by MedGemma BoneAge GP model. Always consult a radiologist for definitive interpretation.
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Bone className="w-5 h-5" />
              <p className="font-bold">MedGemma BoneAge GP</p>
            </div>
            <p className="text-xs text-white/80 mb-4">
              Greulich-Pyle bone age assessment with skeletal landmark detection, growth velocity tracking, and longitudinal analysis.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">94%</p>
                <p className="text-[9px] text-white/70 uppercase">Accuracy</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">580ms</p>
                <p className="text-[9px] text-white/70 uppercase">Latency</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <p className="text-lg font-bold">180MB</p>
                <p className="text-[9px] text-white/70 uppercase">Model</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#999999] uppercase">Child Age (months)</p>
            <div className="flex flex-wrap gap-2">
              {ageOptions.map((age) => (
                <button
                  key={age}
                  onClick={() => { hapticImpact("light"); setSelectedAge(age); }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedAge === age
                      ? "bg-[#E91E63] text-white shadow-md"
                      : "bg-gray-100 text-[#666666] active:bg-gray-200"
                  }`}
                >
                  {age}mo
                </button>
              ))}
            </div>
          </div>

          {children.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#999999] uppercase">Select Child (optional)</p>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 rounded-xl p-3 text-sm text-[#1A1A1A]"
              >
                <option value="">-- Demo mode --</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || !ready}
            className="w-full py-3.5 bg-[#E91E63] text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing X-ray...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Run Bone Age Analysis
              </>
            )}
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                className="rounded-2xl p-4 border-l-4"
                style={{
                  backgroundColor: maturityColors[result.skeletalMaturity].bg,
                  borderLeftColor: maturityColors[result.skeletalMaturity].border,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1A1A1A]">Bone Age Assessment</h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: maturityColors[result.skeletalMaturity].border + "20",
                      color: maturityColors[result.skeletalMaturity].text,
                    }}
                  >
                    {maturityColors[result.skeletalMaturity].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/80 rounded-xl p-3">
                    <p className="text-[10px] text-[#999999] uppercase">Chronological</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{result.chronologicalAgeMonths}mo</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3">
                    <p className="text-[10px] text-[#999999] uppercase">Bone Age</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{result.boneAgeMonths.toFixed(1)}mo</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3">
                    <p className="text-[10px] text-[#999999] uppercase">Z-Score</p>
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: Math.abs(result.boneAgeZScore) > 2
                          ? "#F44336"
                          : Math.abs(result.boneAgeZScore) > 1
                            ? "#FF9800"
                            : "#4CAF50",
                      }}
                    >
                      {result.boneAgeZScore >= 0 ? "+" : ""}{result.boneAgeZScore.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3">
                    <p className="text-[10px] text-[#999999] uppercase">Percentile</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{result.boneAgePercentile}th</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#1A73E8]" />
                    <p className="text-[10px] text-[#999999] uppercase font-semibold">Growth Velocity</p>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{result.growthVelocityCmYear.toFixed(1)}</p>
                  <p className="text-[10px] text-[#666666]">cm/year</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5" style={{ color: fractureColors[result.fractureRisk] }} />
                    <p className="text-[10px] text-[#999999] uppercase font-semibold">Fracture Risk</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: fractureColors[result.fractureRisk] }}>
                    {result.fractureRisk.charAt(0).toUpperCase() + result.fractureRisk.slice(1)}
                  </p>
                  <p className="text-[10px] text-[#666666]">{(result.confidence * 100).toFixed(0)}% confidence</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-[#1A1A1A] mb-2">For Parents</p>
                <p className="text-xs text-[#666666] leading-relaxed">{result.parentSummary}</p>
              </div>

              <button
                onClick={() => { hapticImpact("light"); setShowLandmarks(!showLandmarks); }}
                className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Bone className="w-4 h-4 text-[#E91E63]" />
                  <p className="text-sm font-semibold text-[#1A1A1A]">Skeletal Landmarks ({result.keyLandmarks.length})</p>
                </div>
                {showLandmarks ? <ChevronUp className="w-4 h-4 text-[#CCC]" /> : <ChevronDown className="w-4 h-4 text-[#CCC]" />}
              </button>

              <AnimatePresence>
                {showLandmarks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1.5"
                  >
                    {result.keyLandmarks.map((lm, i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#1A1A1A]">{lm.name}</p>
                          <p className="text-[10px] text-[#666666]">
                            {lm.present ? "Present" : "Not detected"} &bull; {lm.ossification}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#1A73E8]">
                          {(lm.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {result.recommendations.length > 0 && (
                <div className="bg-[#F0F7FF] rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-[#1A73E8] uppercase">Recommendations</p>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-[#333333] leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.icd10Codes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.icd10Codes.map((code) => (
                    <span key={code} className="text-[10px] font-mono font-bold bg-gray-100 text-[#666666] px-2 py-1 rounded-lg">
                      ICD-10: {code}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => { hapticImpact("light"); setShowClinical(!showClinical); }}
                className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9C27B0]" />
                  <p className="text-sm font-semibold text-[#1A1A1A]">Clinical Notes</p>
                </div>
                {showClinical ? <ChevronUp className="w-4 h-4 text-[#CCC]" /> : <ChevronDown className="w-4 h-4 text-[#CCC]" />}
              </button>

              <AnimatePresence>
                {showClinical && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <pre className="bg-[#F8F9FA] rounded-xl p-3 text-[10px] text-[#333333] font-mono whitespace-pre-wrap leading-relaxed">
                      {result.clinicalNotes}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 text-[10px] text-[#999999]">
                <Clock className="w-3 h-3" />
                <span>{result.inferenceTimeMs}ms inference</span>
                <span>&bull;</span>
                <span>medgemma-boneage-v1</span>
              </div>
            </motion.div>
          )}

          {seriesHistory.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E91E63]" />
                <p className="text-sm font-bold text-[#1A1A1A]">Longitudinal Timeline</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {seriesHistory.map((entry, i) => {
                  const colors = maturityColors[entry.skeletalMaturity];
                  return (
                    <div key={entry.id} className="flex-shrink-0 w-24">
                      <div
                        className="rounded-xl p-2.5 text-center border"
                        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                      >
                        <p className="text-[10px] text-[#999999]">#{i + 1}</p>
                        <p className="text-sm font-bold text-[#1A1A1A]">{entry.boneAgeMonths.toFixed(0)}mo</p>
                        <p className="text-[9px]" style={{ color: colors.text }}>{colors.label}</p>
                        <p className="text-[9px] text-[#666666] mt-0.5">
                          Z: {entry.boneAgeZScore.toFixed(1)}
                        </p>
                      </div>
                      {i < seriesHistory.length - 1 && (
                        <div className="flex justify-center my-1">
                          <div className="w-px h-3 bg-gray-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {seriesHistory.length >= 2 && (() => {
                const first = seriesHistory[0];
                const last = seriesHistory[seriesHistory.length - 1];
                const zDelta = last.boneAgeZScore - first.boneAgeZScore;
                return (
                  <div className="bg-[#F8F9FA] rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-[#999999] uppercase">Z-Score Trend</p>
                      <p className={`text-sm font-bold ${zDelta > 0.5 ? "text-[#F44336]" : zDelta < -0.5 ? "text-[#FF9800]" : "text-[#4CAF50]"}`}>
                        {zDelta >= 0 ? "+" : ""}{zDelta.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#999999] uppercase">Analyses</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">{seriesHistory.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#999999] uppercase">Velocity</p>
                      <p className="text-sm font-bold text-[#1A73E8]">{last.growthVelocityCmYear.toFixed(1)} cm/y</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="text-center text-xs text-[#999999] space-y-0.5 pb-6">
            <p>MedGemma BoneAge GP v1.0.0</p>
            <p>Greulich-Pyle standard &bull; Not a diagnostic tool</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

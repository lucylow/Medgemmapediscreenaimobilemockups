import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft, Eye, AlertTriangle, CheckCircle2, Activity,
  ChevronDown, ChevronUp, FileText, Share2, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ROPScreeningResult, ROPMetadata } from "../rop/ropTypes";
import { ROP_ZONE_COLORS } from "../rop/ropTypes";

const priorityColors = {
  immediate: { bg: "bg-red-100", text: "text-red-800", border: "#d93025" },
  high: { bg: "bg-blue-100", text: "text-blue-800", border: "#1a73e8" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800", border: "#f9ab00" },
  low: { bg: "bg-green-100", text: "text-green-800", border: "#137333" },
};

export function ROPResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, metadata } = (location.state ?? {}) as {
    result?: ROPScreeningResult;
    metadata?: ROPMetadata;
  };

  const [showFindings, setShowFindings] = useState(true);
  const [showQuality, setShowQuality] = useState(false);

  if (!result) {
    return (
      <MobileContainer>
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
          <div className="text-center">
            <Eye className="w-12 h-12 text-[#999] mx-auto mb-3" />
            <p className="text-[#666] font-medium">No ROP results</p>
            <button
              onClick={() => navigate("/rop-camera")}
              className="mt-4 text-[#1A73E8] font-medium text-sm"
            >
              Start ROP Screening
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const zoneColor = ROP_ZONE_COLORS[result.zone];
  const isCritical = result.plusDisease || (result.zone === "I" && result.stage >= 2);
  const bannerColor = isCritical ? "#d93025" : result.stage >= 2 ? "#FF9800" : "#34A853";
  const bannerBg = isCritical ? "#fce8e6" : result.stage >= 2 ? "#fef7e0" : "#e6f4ea";

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">ROP Analysis</h1>
            <p className="text-xs text-[#666]">
              GA: {metadata?.gestationalAge}w · PMA: {metadata?.postMenstrualAge}w
            </p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <motion.div
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{ backgroundColor: bannerBg }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isCritical && (
              <motion.div
                className="absolute inset-0 bg-white"
                animate={{ opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/30 rounded-2xl">
                {isCritical ? (
                  <AlertTriangle className="w-10 h-10" style={{ color: bannerColor }} />
                ) : (
                  <CheckCircle2 className="w-10 h-10" style={{ color: bannerColor }} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-2xl font-black" style={{ color: bannerColor }}>
                  {result.etropType}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bannerColor }} />
                  <p className="text-sm font-semibold" style={{ color: bannerColor }}>
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#1A73E8]" />
              ROP Classification
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-3xl font-black" style={{ color: zoneColor }}>
                  {result.zone}
                </p>
                <p className="text-xs text-[#666]">Zone</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-3xl font-black text-[#1A1A1A]">{result.stage}</p>
                <p className="text-xs text-[#666]">Stage</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-xl font-black ${result.plusDisease ? "text-red-600" : "text-green-600"}`}>
                  {result.plusDisease ? "YES" : "NO"}
                </p>
                <p className="text-xs text-[#666]">Plus Disease</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666]">Vascular Tortuosity</span>
                  <span className="font-bold text-[#1A1A1A]">{result.tortuosity.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: result.tortuosity > 6 ? "#EA4335" : result.tortuosity > 3 ? "#F9AB00" : "#34A853",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.tortuosity / 10) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#666]">Arteriolar Dilation</span>
                  <span className="font-bold text-[#1A1A1A]">{result.dilation.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: result.dilation > 5 ? "#EA4335" : result.dilation > 3 ? "#F9AB00" : "#34A853",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.dilation / 10) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] text-sm mb-3">Clinical Summary</h3>
            <p className="text-sm text-[#3c4043] leading-relaxed">{result.clinicalSummary}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Recommendations</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, idx) => {
                const pColor = priorityColors[rec.priority];
                return (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl p-4 border-l-4"
                    style={{ borderLeftColor: pColor.border }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${pColor.bg} ${pColor.text}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#5f6368]">{rec.timeline.toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#202124]">{rec.action}</p>
                    <p className="text-xs text-[#5f6368] mt-1">Evidence: Level {rec.evidence_level}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setShowFindings(!showFindings)}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#9C27B0]" />
                Key Findings ({result.keyFindings.length})
              </h3>
              {showFindings ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
            </div>
            <AnimatePresence>
              {showFindings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-1.5">
                    {result.keyFindings.map((f, i) => (
                      <p key={i} className="text-xs text-[#3c4043] flex items-start gap-2">
                        <span className="text-[#1A73E8] mt-0.5">•</span> {f}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setShowQuality(!showQuality)}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#34A853]" />
                Image Quality Metrics
              </h3>
              {showQuality ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
            </div>
            <AnimatePresence>
              {showQuality && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      { label: "Pupil Dilation", value: result.qualityMetrics.pupilDilation },
                      { label: "Focus Sharpness", value: result.qualityMetrics.focusSharpness },
                      { label: "Lighting", value: result.qualityMetrics.lightingEvenness },
                      { label: "Vascular Contrast", value: result.qualityMetrics.vascularContrast },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#666]">{m.label}</span>
                          <span className="font-bold">{(m.value * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${m.value * 100}%`,
                              backgroundColor: m.value > 0.85 ? "#34A853" : m.value > 0.7 ? "#F9AB00" : "#EA4335",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="col-span-2 text-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-[#666]">Overall: </span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{result.qualityMetrics.overall}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex gap-3">
            <button className="flex-1 bg-[#1A73E8] text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform">
              <FileText className="w-5 h-5" />
              PDF Report
            </button>
            <button className="flex-1 bg-[#34A853] text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          <div className="bg-[#E8F0FE] rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#1A73E8] mt-0.5 shrink-0" />
              <p className="text-sm text-[#1A73E8]">
                This AI screening requires confirmation by a qualified ophthalmologist.
                Do not use as sole basis for treatment decisions.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#999] text-center space-y-1">
            <p>MedGemma ROP Screening · Latency: {result.latencyMs}ms</p>
            <p>ETROP Classification · Not a diagnostic tool</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { AIPipelineAnimation } from "../components/AIPipelineAnimation";
import { RiskBanner } from "../components/ai/RiskBanner";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, XCircle,
  ChevronDown, ChevronUp, FileText, Share2, Shield, Brain,
  Activity, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { EnhancedScreeningResult, PediatricScreeningInput } from "../rop/ropTypes";
import { ROP_RISK_CONFIG } from "../rop/ropTypes";

const priorityColors = {
  immediate: { bg: "bg-red-100", text: "text-red-800", border: "#d93025" },
  high: { bg: "bg-blue-100", text: "text-blue-800", border: "#1a73e8" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800", border: "#f9ab00" },
  low: { bg: "bg-green-100", text: "text-green-800", border: "#137333" },
};

export function EnhancedResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, input } = (location.state ?? {}) as {
    result?: EnhancedScreeningResult;
    input?: PediatricScreeningInput;
  };

  const [showFindings, setShowFindings] = useState(true);
  const [showICD10, setShowICD10] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);

  if (!result) {
    return (
      <MobileContainer>
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-[#999] mx-auto mb-3" />
            <p className="text-[#666] font-medium">No screening results</p>
            <button
              onClick={() => navigate("/screening-input")}
              className="mt-4 text-[#1A73E8] font-medium text-sm"
            >
              Run New Screening
            </button>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const asq3 = result.asq3_equivalent;

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Clinical Results</h1>
            <p className="text-xs text-[#666666]">{result.modelVersion}</p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <RiskBanner
            riskLevel={result.risk_level}
            confidence={result.confidence}
            subtitle={`ASQ-3: ${asq3.percentile}th percentile`}
          />

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#1A73E8]" />
              ASQ-3 Equivalent Scores
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-[#1A1A1A]">{asq3.raw_score}</p>
                <p className="text-xs text-[#666]">Raw Score /60</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black" style={{ color: ROP_RISK_CONFIG[result.risk_level].textColor }}>
                  {asq3.percentile}<span className="text-sm">th</span>
                </p>
                <p className="text-xs text-[#666]">Percentile</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-xl font-black ${asq3.cutoff_flag ? "text-red-600" : "text-green-600"}`}>
                  {asq3.cutoff_flag ? "Below" : "Above"}
                </p>
                <p className="text-xs text-[#666]">Cutoff</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(asq3.domain_breakdown).map(([domain, score]) => (
                <div key={domain}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#666] capitalize">{domain}</span>
                    <span className="font-bold text-[#1A1A1A]">{score}/20</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: score < 8 ? "#EA4335" : score < 12 ? "#F9AB00" : "#34A853",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / 20) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] text-sm mb-3">Clinical Summary</h3>
            <p className="text-sm text-[#3c4043] leading-relaxed">{result.clinical_summary}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Next Steps</h3>
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
                Key Findings ({result.key_findings.length})
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
                    {result.key_findings.map((f, i) => (
                      <p key={i} className="text-xs text-[#3c4043] flex items-start gap-2">
                        <span className="text-[#1A73E8] mt-0.5">•</span>
                        {f}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {result.icd10_codes.length > 0 && (
            <button
              onClick={() => setShowICD10(!showICD10)}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#EA4335]" />
                  ICD-10 Codes ({result.icd10_codes.length})
                </h3>
                {showICD10 ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
              </div>
              <AnimatePresence>
                {showICD10 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.icd10_codes.map((code) => (
                        <span
                          key={code}
                          className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-xs font-mono font-bold"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}

          <button
            onClick={() => setShowPipeline(!showPipeline)}
            className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#1A73E8]" />
                AI Pipeline Details
              </h3>
              {showPipeline ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
            </div>
            <AnimatePresence>
              {showPipeline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3">
                    <AIPipelineAnimation
                      progress={1}
                      completed
                      modelSize={450}
                      memoryUsage={320}
                      latencyMs={result.latencyMs}
                    />
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
                An AI assistant prepared this screening summary. Take this to your child's doctor,
                nurse, or health worker. Do not make major decisions based on this app alone.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#999] text-center space-y-1">
            <p>Model: {result.modelVersion}</p>
            <p>Latency: {result.latencyMs}ms · Confidence: {(result.confidence * 100).toFixed(0)}%</p>
            <p>Not a diagnostic tool · Requires clinician review</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

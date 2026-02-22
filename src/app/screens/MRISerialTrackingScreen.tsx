import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Trash2, BarChart3, Brain
} from "lucide-react";
import { motion } from "motion/react";
import type { MRISeriesEntry } from "../mri/mriTypes";
import { MRI_RISK_COLORS, MRI_RISK_LABELS, MRI_SCAN_LABELS } from "../mri/mriTypes";

export function MRISerialTrackingScreen() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<MRISeriesEntry[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mri_series_history") ?? "[]") as MRISeriesEntry[];
    setEntries(stored.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("mri_series_history");
    setEntries([]);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("mri_series_history", JSON.stringify(updated));
  };

  const riskToNum = (risk: string): number => {
    switch (risk) {
      case "NO_CHANGE": return 0;
      case "INCREASED": return 1;
      case "SIGNIFICANT_INCREASE": return 2;
      case "CRITICAL": return 3;
      default: return 0;
    }
  };

  const getTrend = (): "improving" | "stable" | "worsening" | null => {
    if (entries.length < 2) return null;
    const first = riskToNum(entries[0].riskAmplification);
    const last = riskToNum(entries[entries.length - 1].riskAmplification);
    if (last < first) return "improving";
    if (last > first) return "worsening";
    return "stable";
  };

  const getBrainAgeTrend = (): "improving" | "stable" | "worsening" | null => {
    if (entries.length < 2) return null;
    const firstGap = Math.abs(entries[0].domainScores.brainAgeGapMonths);
    const lastGap = Math.abs(entries[entries.length - 1].domainScores.brainAgeGapMonths);
    if (lastGap < firstGap - 0.5) return "improving";
    if (lastGap > firstGap + 0.5) return "worsening";
    return "stable";
  };

  const trend = getTrend();
  const brainAgeTrend = getBrainAgeTrend();
  const maxBarHeight = 100;

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E3F2FD] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Brain Age Tracking</h1>
            <p className="text-sm text-[#666666]">Longitudinal MRI analysis</p>
          </div>
          {entries.length > 0 && (
            <button onClick={clearHistory} className="p-2">
              <Trash2 className="w-5 h-5 text-[#999]" />
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="px-4">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
              <Brain className="w-12 h-12 text-[#CCC] mx-auto mb-3" />
              <p className="font-semibold text-[#1A1A1A]">No MRI Studies Yet</p>
              <p className="text-sm text-[#666666] mt-2">
                Complete MRI analyses and save them to track brain development over time.
              </p>
              <button
                onClick={() => navigate("/mri-import")}
                className="mt-4 bg-[#1565C0] text-white px-6 py-2 rounded-xl text-sm font-medium"
              >
                Run MRI Analysis
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-4">
            {trend && (
              <div className={`rounded-2xl p-4 flex items-center gap-3 ${
                trend === "improving" ? "bg-green-50 border border-green-200"
                  : trend === "worsening" ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}>
                {trend === "improving" && <TrendingDown className="w-5 h-5 text-green-600" />}
                {trend === "worsening" && <TrendingUp className="w-5 h-5 text-red-600" />}
                {trend === "stable" && <Minus className="w-5 h-5 text-blue-600" />}
                <div>
                  <p className={`font-semibold text-sm ${
                    trend === "improving" ? "text-green-800"
                      : trend === "worsening" ? "text-red-800"
                      : "text-blue-800"
                  }`}>
                    {trend === "improving" ? "Risk Decreasing" : trend === "worsening" ? "Risk Increasing" : "Risk Stable"}
                  </p>
                  <p className="text-xs text-[#666]">
                    Across {entries.length} studies
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Brain Age Gap Timeline</h3>
              <div className="flex items-end gap-2 justify-center" style={{ height: maxBarHeight + 60 }}>
                {entries.map((entry) => {
                  const gap = entry.domainScores.brainAgeGapMonths;
                  const absGap = Math.abs(gap);
                  const barHeight = Math.max(15, (absGap / 8) * maxBarHeight);
                  const color = absGap > 4 ? "#EA4335" : absGap > 2 ? "#F9AB00" : "#34A853";
                  return (
                    <div key={entry.id} className="flex flex-col items-center gap-1" style={{ flex: 1, maxWidth: 60 }}>
                      <span className="text-[10px] font-bold" style={{ color }}>
                        {gap > 0 ? "+" : ""}{gap.toFixed(1)}m
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        className="w-full rounded-t-lg"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[9px] text-[#999]">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      <span className="text-[8px] text-[#BBB]">{entry.patientAgeMonths}mo</span>
                    </div>
                  );
                })}
              </div>
              {brainAgeTrend && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {brainAgeTrend === "improving" && <TrendingDown className="w-4 h-4 text-green-500" />}
                  {brainAgeTrend === "worsening" && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {brainAgeTrend === "stable" && <Minus className="w-4 h-4 text-blue-500" />}
                  <span className="text-xs text-[#666]">
                    Brain age gap {brainAgeTrend === "improving" ? "narrowing" : brainAgeTrend === "worsening" ? "widening" : "stable"}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Domain Trends</h3>
              <div className="space-y-3">
                {(["whiteMatterIntegrity", "myelinationScore", "ventricularRatio", "corticalThickness"] as const).map((key) => {
                  const labels: Record<string, string> = {
                    whiteMatterIntegrity: "WM Integrity (FA)",
                    myelinationScore: "Myelination",
                    ventricularRatio: "Ventricular Ratio",
                    corticalThickness: "Cortical Thickness",
                  };
                  return (
                    <div key={key}>
                      <p className="text-xs text-[#666] mb-1">{labels[key]}</p>
                      <div className="flex items-center gap-1">
                        {entries.map((entry) => {
                          const val = entry.domainScores[key];
                          const pct = key === "corticalThickness" ? (val / 3) * 100 : val * 100;
                          const color = key === "ventricularRatio"
                            ? (val > 0.25 ? "#EA4335" : val > 0.18 ? "#F9AB00" : "#34A853")
                            : key === "corticalThickness"
                              ? (val < 1.8 ? "#EA4335" : val < 2.2 ? "#F9AB00" : "#34A853")
                              : (val < 0.65 ? "#EA4335" : val < 0.8 ? "#F9AB00" : "#34A853");
                          return (
                            <div key={entry.id} className="flex-1 flex items-center gap-1">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(100, pct)}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-[#999] w-10 text-right">
                                {key === "corticalThickness" ? `${val.toFixed(1)}` : `${(val * 100).toFixed(0)}%`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#999] uppercase tracking-wider">Study History</h3>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  className="bg-white border-2 border-gray-100 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: MRI_RISK_COLORS[entry.riskAmplification] }}
                      />
                      <span className="font-semibold text-sm text-[#1A1A1A]">
                        {MRI_RISK_LABELS[entry.riskAmplification]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#999]">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <button onClick={() => removeEntry(entry.id)} className="p-1">
                        <Trash2 className="w-3.5 h-3.5 text-[#CCC]" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#999]">Sequence</span>
                      <p className="font-medium text-[#1A1A1A]">{MRI_SCAN_LABELS[entry.modality]}</p>
                    </div>
                    <div>
                      <span className="text-[#999]">Brain Age Gap</span>
                      <p className="font-bold" style={{
                        color: Math.abs(entry.domainScores.brainAgeGapMonths) > 2 ? "#EA4335" : "#34A853"
                      }}>
                        {entry.domainScores.brainAgeGapMonths > 0 ? "+" : ""}{entry.domainScores.brainAgeGapMonths.toFixed(1)}m
                      </p>
                    </div>
                    <div>
                      <span className="text-[#999]">Latency</span>
                      <p className="font-medium text-[#1A1A1A]">{(entry.latencyMs / 1000).toFixed(1)}s</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}

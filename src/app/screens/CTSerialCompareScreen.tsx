import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Trash2, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { CTSeriesEntry } from "../ct/ctTypes";
import { CT_RISK_COLORS, CT_RISK_LABELS, CT_MODALITY_LABELS } from "../ct/ctTypes";

export function CTSerialCompareScreen() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CTSeriesEntry[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ct_series_history") ?? "[]") as CTSeriesEntry[];
    setEntries(stored.sort((a, b) => a.timestamp - b.timestamp));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("ct_series_history");
    setEntries([]);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("ct_series_history", JSON.stringify(updated));
  };

  const riskTierToNum = (tier: string): number => {
    switch (tier) {
      case "ON_TRACK": return 0;
      case "MONITOR": return 1;
      case "REFER": return 2;
      case "CRITICAL": return 3;
      default: return 0;
    }
  };

  const getTrend = (): "improving" | "stable" | "worsening" | null => {
    if (entries.length < 2) return null;
    const first = riskTierToNum(entries[0].riskTier);
    const last = riskTierToNum(entries[entries.length - 1].riskTier);
    if (last < first) return "improving";
    if (last > first) return "worsening";
    return "stable";
  };

  const trend = getTrend();
  const maxBarHeight = 120;

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#E0F7FA] to-[#F5F5F5] pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Serial CT Comparison</h1>
            <p className="text-sm text-[#666666]">Track risk progression over time</p>
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
              <BarChart3 className="w-12 h-12 text-[#CCC] mx-auto mb-3" />
              <p className="font-semibold text-[#1A1A1A]">No CT Studies Yet</p>
              <p className="text-sm text-[#666666] mt-2">
                Complete CT analyses and save them to build a serial comparison timeline.
              </p>
              <button
                onClick={() => navigate("/ct-import")}
                className="mt-4 bg-[#00838F] text-white px-6 py-2 rounded-xl text-sm font-medium"
              >
                Run CT Analysis
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
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Risk Timeline</h3>
              <div className="flex items-end gap-2 justify-center" style={{ height: maxBarHeight + 40 }}>
                {entries.map((entry, idx) => {
                  const tierNum = riskTierToNum(entry.riskTier);
                  const barHeight = 20 + (tierNum / 3) * maxBarHeight;
                  return (
                    <div key={entry.id} className="flex flex-col items-center gap-1" style={{ flex: 1, maxWidth: 60 }}>
                      <span className="text-[10px] font-bold" style={{ color: CT_RISK_COLORS[entry.riskTier] }}>
                        {CT_RISK_LABELS[entry.riskTier]}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        className="w-full rounded-t-lg"
                        style={{ backgroundColor: CT_RISK_COLORS[entry.riskTier] }}
                      />
                      <span className="text-[9px] text-[#999]">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Score Trends</h3>
              <div className="space-y-3">
                {(["hemorrhageRisk", "fractureRisk", "necRisk", "tumorBurden"] as const).map((key) => {
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                  return (
                    <div key={key}>
                      <p className="text-xs text-[#666] mb-1">{label}</p>
                      <div className="flex items-center gap-1">
                        {entries.map((entry, idx) => {
                          const val = entry.domainScores[key];
                          return (
                            <div key={entry.id} className="flex-1 flex items-center gap-1">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${val * 100}%`,
                                    backgroundColor: val > 0.6 ? "#EA4335" : val > 0.4 ? "#F9AB00" : "#34A853",
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-[#999] w-8 text-right">
                                {(val * 100).toFixed(0)}%
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
                        style={{ backgroundColor: CT_RISK_COLORS[entry.riskTier] }}
                      />
                      <span className="font-semibold text-sm text-[#1A1A1A]">
                        {CT_RISK_LABELS[entry.riskTier]}
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
                      <span className="text-[#999]">Modality</span>
                      <p className="font-medium text-[#1A1A1A]">{CT_MODALITY_LABELS[entry.modality]}</p>
                    </div>
                    <div>
                      <span className="text-[#999]">Slices</span>
                      <p className="font-medium text-[#1A1A1A]">{entry.sliceCount}</p>
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

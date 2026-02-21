import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { motion } from "motion/react";

export function FeatureImportance() {
  const navigate = useNavigate();

  const waterfallData = [
    { feature: "Baseline", value: 5, cumulative: 5, color: "#666666", direction: "" },
    { feature: "Speech regression", value: 42, cumulative: 47, color: "#EA4335", direction: "up" },
    { feature: "No 2-word combos", value: 31, cumulative: 78, color: "#FF4444", direction: "up" },
    { feature: "Age 24mo", value: 12, cumulative: 90, color: "#FF9800", direction: "up" },
    { feature: "Z-score -1.8", value: 7, cumulative: 97.3, color: "#FBBC05", direction: "up" },
  ];

  const shapValues = [
    { feature: "Speech regression", shap: 0.42, color: "#EA4335" },
    { feature: "No combinations", shap: 0.31, color: "#FF4444" },
    { feature: "Vocabulary <50", shap: 0.18, color: "#FF9800" },
    { feature: "Joint attention", shap: 0.14, color: "#FBBC05" },
    { feature: "Growth delay", shap: 0.07, color: "#FDD835" },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/attention-maps")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Feature Importance</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Decision Explained */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">AI DECISION EXPLAINED</h2>
            <p className="text-white/90 text-sm">Waterfall analysis showing step-by-step risk calculation</p>
          </div>

          {/* Waterfall Summary */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Risk Accumulation Path</h3>
            
            <div className="space-y-3">
              {waterfallData.map((item, index) => (
                <motion.div
                  key={item.feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  {item.direction === "up" ? (
                    <TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  ) : (
                    <div className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#1A1A1A]">{item.feature}</span>
                      <span className="font-bold" style={{ color: item.color }}>
                        {item.direction === "up" && "+"}
                        {item.value}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            backgroundColor: item.color,
                            width: `${(item.cumulative / 100) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#666666]">
                        → {item.cumulative}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 bg-[#EA4335]/10 border-l-4 border-[#EA4335] rounded-xl p-4">
              <p className="font-bold text-[#EA4335] mb-1">FINAL: REFERRAL</p>
              <p className="text-sm text-[#666666]">97.3% Confidence (Threshold: 90%)</p>
            </div>
          </div>

          {/* SHAP Values Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">SHAP Values Visualization</h3>
            <p className="text-sm text-[#666666] mb-4">
              Shapley Additive exPlanations - Feature contribution to prediction
            </p>
            
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={shapValues}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis type="number" stroke="#666666" style={{ fontSize: "12px" }} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                />
                <Tooltip />
                <ReferenceLine x={0} stroke="#666666" />
                <Bar dataKey="shap" radius={[0, 8, 8, 0]}>
                  {shapValues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Model Confidence */}
          <div className="bg-gradient-to-br from-[#34A853] to-[#1A73E8] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Model Confidence Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/90">Feature Alignment</span>
                <span className="font-bold text-2xl">96.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Clinical Guidelines</span>
                <span className="font-bold text-2xl">98.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Historical Accuracy</span>
                <span className="font-bold text-2xl">97.6%</span>
              </div>
              <div className="border-t border-white/30 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Overall Confidence</span>
                  <span className="font-bold text-3xl text-[#FBBC05]">97.3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Context */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h4 className="font-bold text-[#1A1A1A] mb-3">Why This Matters</h4>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li>• Speech regression is a critical autism red flag at 24mo</li>
              <li>• No 2-word combinations significantly below developmental curve</li>
              <li>• Growth delay (Z=-1.8) may indicate systemic issues</li>
              <li>• Early intervention critical: 90%+ outcomes improve before 36mo</li>
            </ul>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate("/validation-dashboard")}>
            View Clinical Validation
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

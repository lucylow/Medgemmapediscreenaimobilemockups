import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, TrendingDown, AlertTriangle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";

export function ASQ3Dashboard() {
  const navigate = useNavigate();

  const radarData = [
    { domain: "Communication", score: 18, fullMark: 60, percentile: 3 },
    { domain: "Gross Motor", score: 42, fullMark: 60, percentile: 65 },
    { domain: "Fine Motor", score: 36, fullMark: 60, percentile: 28 },
    { domain: "Problem Solving", score: 24, fullMark: 60, percentile: 12 },
    { domain: "Personal-Social", score: 30, fullMark: 60, percentile: 18 },
  ];

  const riskTiers = [
    { level: "REFERRAL", domain: "Communication", confidence: 97.3, color: "#EA4335", icon: "🔴" },
    { level: "URGENT", domain: "Problem Solving", confidence: 89.2, color: "#FF9800", icon: "🟠" },
    { level: "MONITOR", domain: "Fine Motor", confidence: 82.1, color: "#FBBC05", icon: "🟡" },
    { level: "ON-TRACK", domain: "Gross Motor", confidence: 94.7, color: "#34A853", icon: "🔵" },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/live-inference")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">ASQ-3 Score Dashboard</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Alert Banner */}
          <motion.div
            className="bg-[#EA4335] rounded-2xl p-5 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-1">REFERRAL REQUIRED</h3>
                <p className="text-sm text-white/90">
                  Communication domain at 3rd percentile - Speech therapist consult needed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">ASQ-3 COMPOSITE SCORE</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: "#666666", fontSize: 11 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 60]} tick={{ fill: "#999999" }} />
                <Radar
                  name="Patient Score"
                  dataKey="score"
                  stroke="#1A73E8"
                  fill="#1A73E8"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Domain Scores */}
            <div className="space-y-2 mt-4">
              {radarData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-[#666666]">{item.domain}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1A1A1A]">
                      {item.score}/60
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        item.percentile < 15
                          ? "bg-[#EA4335] text-white"
                          : item.percentile < 25
                          ? "bg-[#FF9800] text-white"
                          : item.percentile < 50
                          ? "bg-[#FBBC05] text-white"
                          : "bg-[#34A853] text-white"
                      }`}
                    >
                      {item.percentile}th %ile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Stratification Pyramid */}
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">RISK STRATIFICATION</h2>
            <div className="space-y-3">
              {riskTiers.map((tier, index) => (
                <motion.div
                  key={tier.level}
                  className="rounded-2xl p-5 text-white"
                  style={{ backgroundColor: tier.color }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tier.icon}</span>
                      <span className="font-bold text-lg">{tier.level}</span>
                    </div>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {tier.confidence}% Conf
                    </span>
                  </div>
                  <p className="text-sm text-white/90">{tier.domain} Domain</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MedGemma Analysis */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">MedGemma AI Analysis</h3>
            <div className="space-y-2 text-sm">
              <p>✓ Speech regression detected (high confidence)</p>
              <p>✓ No 50+ word vocabulary at 24mo</p>
              <p>✓ Limited 2-word combinations</p>
              <p>✓ Joint attention concerns noted</p>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton variant="destructive" fullWidth={false}>
              Detailed Report
            </PrimaryButton>
            <PrimaryButton variant="primary" fullWidth={false} onClick={() => navigate("/who-growth")}>
              Growth Charts
            </PrimaryButton>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

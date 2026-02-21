import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "motion/react";

export function AIPredictions() {
  const navigate = useNavigate();

  const predictionData = [
    { month: 24, height: 15, speech: 3, boneAge: -1.8, projected: false },
    { month: 27, height: 14, speech: 4, boneAge: -1.9, projected: true },
    { month: 30, height: 13, speech: 4, boneAge: -2.0, projected: true },
    { month: 33, height: 12, speech: 5, boneAge: -2.1, projected: true },
    { month: 36, height: 12, speech: 5, boneAge: -2.1, projected: true },
  ];

  const interventionScenarios = [
    {
      title: "Speech Therapy",
      impact: "+22 ASQ3 points",
      outcome: "5th → 25th %ile",
      color: "#34A853",
      icon: TrendingUp,
    },
    {
      title: "Growth Hormone",
      impact: "Z=-1.2 trajectory",
      outcome: "15th → 35th %ile",
      color: "#1A73E8",
      icon: Activity,
    },
    {
      title: "No Intervention",
      impact: "Z=-2.6 projected",
      outcome: "97% referral risk",
      color: "#EA4335",
      icon: TrendingDown,
    },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/training-feedback")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">AI Growth Predictions</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Current Status */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">CURRENT STATUS</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/80 text-xs mb-1">Age</p>
                <p className="text-2xl font-bold">24mo</p>
              </div>
              <div>
                <p className="text-white/80 text-xs mb-1">Bone Age Z</p>
                <p className="text-2xl font-bold text-[#FF9800]">-1.8</p>
              </div>
              <div>
                <p className="text-white/80 text-xs mb-1">ASQ3</p>
                <p className="text-2xl font-bold text-[#EA4335]">18/60</p>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          <motion.div
            className="bg-[#FF9800]/10 border-l-4 border-[#FF9800] rounded-2xl p-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#FF9800] flex-shrink-0" />
              <div>
                <p className="font-bold text-[#FF9800] mb-1">Intervention Window: 12 months</p>
                <p className="text-sm text-[#666666]">
                  Early intervention before 36mo critical for optimal outcomes (90%+ success rate)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Prediction Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
              PREDICTED 36mo OUTCOMES
            </h3>
            <p className="text-sm text-[#666666] mb-4">
              MedGemma-4B longitudinal forecast without intervention
            </p>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="heightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA4335" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EA4335" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="speechGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="month"
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                  label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
                />
                <YAxis stroke="#666666" style={{ fontSize: "11px" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="height"
                  stroke="#EA4335"
                  strokeWidth={3}
                  fill="url(#heightGradient)"
                  name="Height %ile"
                />
                <Area
                  type="monotone"
                  dataKey="speech"
                  stroke="#FF9800"
                  strokeWidth={3}
                  fill="url(#speechGradient)"
                  name="Speech %ile"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-around mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#EA4335] rounded"></div>
                <span className="text-[#666666]">Height: 15th → 12th %ile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FF9800] rounded"></div>
                <span className="text-[#666666]">Speech: 3rd → 5th %ile</span>
              </div>
            </div>
          </div>

          {/* Intervention Simulator */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">INTERVENTION SIMULATOR</h3>
            <div className="space-y-3">
              {interventionScenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.title}
                  className="bg-white border-2 rounded-2xl p-5"
                  style={{ borderColor: scenario.color }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${scenario.color}20` }}
                    >
                      <scenario.icon className="w-6 h-6" style={{ color: scenario.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1A1A1A] mb-1">{scenario.title}</h4>
                      <p className="text-sm font-semibold mb-1" style={{ color: scenario.color }}>
                        {scenario.impact}
                      </p>
                      <p className="text-xs text-[#666666]">{scenario.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Confidence Interval */}
          <div className="bg-gradient-to-br from-[#34A853] to-[#1A73E8] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Prediction Confidence</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/90">Model Accuracy (Historical)</span>
                <span className="font-bold">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/90">Confidence Interval (95%)</span>
                <span className="font-bold">±4mo bone age</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/90">Prediction Horizon</span>
                <span className="font-bold">12 months</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-sm">
                Predictions based on 10,247 longitudinal cases with 6-month follow-up data
              </p>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <PrimaryButton onClick={() => navigate("/impact")}>
            View ROI Impact Dashboard
          </PrimaryButton>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-[#1A73E8] font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
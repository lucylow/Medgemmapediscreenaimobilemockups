import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Award, Target, TrendingUp, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { motion } from "motion/react";

export function ValidationDashboard() {
  const navigate = useNavigate();

  const calibrationData = [
    { predicted: 10, observed: 12 },
    { predicted: 20, observed: 19 },
    { predicted: 30, observed: 31 },
    { predicted: 40, observed: 38 },
    { predicted: 50, observed: 52 },
    { predicted: 60, observed: 59 },
    { predicted: 70, observed: 71 },
    { predicted: 80, observed: 83 },
    { predicted: 90, observed: 92 },
    { predicted: 100, observed: 98 },
  ];

  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.02, tpr: 0.15 },
    { fpr: 0.04, tpr: 0.35 },
    { fpr: 0.055, tpr: 0.964 },
    { fpr: 0.08, tpr: 0.98 },
    { fpr: 0.15, tpr: 0.995 },
    { fpr: 1, tpr: 1 },
  ];

  const metrics = [
    { label: "AUC-ROC", value: "0.976", icon: Award, color: "#FF9800", subtext: "Gold Standard" },
    { label: "Sensitivity", value: "96.4%", icon: Target, color: "#34A853", subtext: "vs Pediatricians" },
    { label: "Specificity", value: "94.5%", icon: TrendingUp, color: "#1A73E8", subtext: "Population Screen" },
    { label: "Cohort Size", value: "10,247", icon: Users, color: "#9C27B0", subtext: "Validated Cases" },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/feature-importance")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Clinical Validation</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-10 h-10" />
              <div>
                <h2 className="text-2xl font-bold">Gold Standard</h2>
                <p className="text-white/90 text-sm">ASQ-3 + MD Review Validated</p>
              </div>
            </div>
            <p className="text-3xl font-bold mt-2">n = 10,247 children</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="bg-white border-2 border-gray-200 rounded-2xl p-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  <span className="text-xs font-bold text-[#666666]">{metric.label}</span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: metric.color }}>
                  {metric.value}
                </p>
                <p className="text-xs text-[#999999]">{metric.subtext}</p>
              </motion.div>
            ))}
          </div>

          {/* ROC Curve */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">ROC Curve Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="fpr"
                  domain={[0, 1]}
                  label={{ value: "False Positive Rate", position: "insideBottom", offset: -5 }}
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#1A73E8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#1A73E8" }}
                  name="PediScreen"
                />
                <Line
                  type="monotone"
                  data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                  dataKey="tpr"
                  stroke="#999999"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Random"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-4 h-4 bg-[#1A73E8] rounded"></div>
              <span className="text-xs text-[#666666]">AUC = 0.976 (Excellent)</span>
            </div>
          </div>

          {/* Calibration Plot */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Calibration Plot</h3>
            <p className="text-sm text-[#666666] mb-4">
              Expected vs Observed Referral Rates (Brier Score)
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="predicted"
                  domain={[0, 100]}
                  label={{ value: "Predicted (%)", position: "insideBottom", offset: -5 }}
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{ value: "Observed (%)", angle: -90, position: "insideLeft" }}
                  stroke="#666666"
                  style={{ fontSize: "11px" }}
                />
                <Tooltip />
                <Scatter data={calibrationData} fill="#1A73E8">
                  {calibrationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#1A73E8" />
                  ))}
                </Scatter>
                <Line
                  type="monotone"
                  data={[{ predicted: 0, observed: 0 }, { predicted: 100, observed: 100 }]}
                  dataKey="observed"
                  stroke="#34A853"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-[#999999] mt-2">
              Green line = Perfect calibration • Blue dots = Model performance
            </p>
          </div>

          {/* Inter-Rater Agreement */}
          <div className="bg-gradient-to-br from-[#9C27B0] to-[#673AB7] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Inter-Rater Agreement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/90">PediScreen vs MD</span>
                <span className="font-bold text-2xl">κ = 0.89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">CHW-CHW Consistency</span>
                <span className="font-bold text-2xl">κ = 0.87</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90">Test-Retest (6mo)</span>
                <span className="font-bold text-2xl">ICC = 0.92</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-sm text-white/90">
                <span className="font-bold">Excellent agreement</span> across all metrics (κ &gt; 0.81)
              </p>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton variant="primary" fullWidth={false} onClick={() => navigate("/training-feedback")}>
              CHW Training
            </PrimaryButton>
            <PrimaryButton variant="secondary" fullWidth={false}>
              Export Metrics
            </PrimaryButton>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

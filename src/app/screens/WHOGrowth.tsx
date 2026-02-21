import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, AlertTriangle, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "motion/react";

export function WHOGrowth() {
  const navigate = useNavigate();

  const heightData = [
    { age: 0, patient: 50, median: 50, minus2sd: 46, plus2sd: 54 },
    { age: 6, patient: 65, median: 68, minus2sd: 62, plus2sd: 74 },
    { age: 12, patient: 74, median: 78, minus2sd: 72, plus2sd: 84 },
    { age: 18, patient: 81, median: 86, minus2sd: 80, plus2sd: 92 },
    { age: 24, patient: 85, median: 91, minus2sd: 85, plus2sd: 97 },
    { age: 30, patient: 88, median: 95, minus2sd: 89, plus2sd: 101 },
  ];

  const weightData = [
    { age: 0, patient: 3.5, median: 3.5, bmi: 0 },
    { age: 6, patient: 7.2, median: 8.0, bmi: -0.8 },
    { age: 12, patient: 9.5, median: 10.2, bmi: -1.0 },
    { age: 18, patient: 11.2, median: 12.0, bmi: -1.1 },
    { age: 24, patient: 12.5, median: 13.5, bmi: -1.2 },
    { age: 30, patient: 13.8, median: 15.0, bmi: -1.2 },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/asq3-dashboard")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">WHO Growth Standards</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Alert */}
          <motion.div
            className="bg-[#FF9800]/10 border-l-4 border-[#FF9800] rounded-2xl p-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#FF9800] flex-shrink-0" />
              <div>
                <p className="font-bold text-[#FF9800]">Growth Velocity Concern</p>
                <p className="text-sm text-[#666666] mt-1">
                  Patient tracking below 15th percentile - Endocrinology consult recommended
                </p>
              </div>
            </div>
          </motion.div>

          {/* Current Z-Scores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border-2 border-[#EA4335] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#666666] mb-2">Height</p>
              <p className="text-2xl font-bold text-[#EA4335]">15th</p>
              <p className="text-xs text-[#666666] mt-1">percentile</p>
              <TrendingDown className="w-5 h-5 text-[#EA4335] mx-auto mt-2" />
            </div>
            <div className="bg-white border-2 border-[#FBBC05] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#666666] mb-2">Weight</p>
              <p className="text-2xl font-bold text-[#FBBC05]">25th</p>
              <p className="text-xs text-[#666666] mt-1">percentile</p>
            </div>
            <div className="bg-white border-2 border-[#FF9800] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#666666] mb-2">BMI Z</p>
              <p className="text-2xl font-bold text-[#FF9800]">-1.2</p>
              <p className="text-xs text-[#666666] mt-1">Z-score</p>
            </div>
          </div>

          {/* Height-for-Age Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">HEIGHT-FOR-AGE (cm)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={heightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="age"
                  label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
                  stroke="#666666"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#666666" style={{ fontSize: "12px" }} />
                <Tooltip />
                <ReferenceLine y={85} stroke="#EA4335" strokeDasharray="5 5" label="-2SD" />
                <ReferenceLine y={97} stroke="#34A853" strokeDasharray="5 5" label="+2SD" />
                <Line
                  type="monotone"
                  dataKey="median"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Median (0SD)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="patient"
                  stroke="#EA4335"
                  strokeWidth={3}
                  name="Patient"
                  dot={{ r: 4, fill: "#EA4335" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-[#999999] mt-2">
              WHO Child Growth Standards (2006) - Female, 0-30 months
            </p>
          </div>

          {/* Weight-for-Age Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">WEIGHT-FOR-AGE (kg)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="age"
                  label={{ value: "Age (months)", position: "insideBottom", offset: -5 }}
                  stroke="#666666"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#666666" style={{ fontSize: "12px" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="median"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Median"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="patient"
                  stroke="#FF9800"
                  strokeWidth={3}
                  name="Patient Weight"
                  dot={{ r: 4, fill: "#FF9800" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bone Age Comparison */}
          <div className="bg-gradient-to-br from-[#9C27B0] to-[#673AB7] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Bone Age Analysis</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Chronological Age</p>
                <p className="text-3xl font-bold">30mo</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Bone Age</p>
                <p className="text-3xl font-bold text-[#EA4335]">26mo</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Delay</p>
                <p className="text-3xl font-bold text-[#FF9800]">-1.8</p>
                <p className="text-xs text-white/80">Z-score</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm">
                Greulich-Pyle Atlas: Bone age delay accelerating from -1.2 (6mo ago) to -1.8 Z-score
              </p>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate("/attention-maps")}>
            View AI Explainability
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

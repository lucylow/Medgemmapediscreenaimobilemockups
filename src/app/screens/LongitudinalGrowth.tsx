import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Camera, TrendingDown, AlertTriangle } from "lucide-react";
import { mockPatients, growthData } from "../data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function LongitudinalGrowth() {
  const navigate = useNavigate();
  const { id } = useParams();
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate(`/patient/${patient.id}`)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Longitudinal Growth</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              {patient.id} • {patient.age} {patient.gender}
            </h2>
            <p className="text-sm text-[#666666] mt-2">Growth tracking over 6 months</p>
          </div>

          {/* Alert */}
          <div className="bg-[#FF9800]/10 border-l-4 border-[#FF9800] rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[#FF9800] flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-[#FF9800]">Bone Age Delay Accelerating</p>
              <p className="text-sm text-[#666666] mt-1">
                Current delay: -1.8 Z-score (was -1.2 Z six months ago)
              </p>
            </div>
          </div>

          {/* Current Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border-2 border-[#EA4335] rounded-2xl p-4 text-center">
              <p className="text-sm text-[#666666] mb-2">Height</p>
              <p className="text-2xl font-bold text-[#EA4335]">15th</p>
              <p className="text-xs text-[#666666] mt-1">%ile</p>
              <TrendingDown className="w-5 h-5 text-[#EA4335] mx-auto mt-2" />
            </div>
            <div className="bg-white border-2 border-[#FBBC05] rounded-2xl p-4 text-center">
              <p className="text-sm text-[#666666] mb-2">Weight</p>
              <p className="text-2xl font-bold text-[#FBBC05]">25th</p>
              <p className="text-xs text-[#666666] mt-1">%ile</p>
            </div>
            <div className="bg-white border-2 border-[#FF9800] rounded-2xl p-4 text-center">
              <p className="text-sm text-[#666666] mb-2">Bone Age</p>
              <p className="text-2xl font-bold text-[#FF9800]">-1.8</p>
              <p className="text-xs text-[#666666] mt-1">Z-score</p>
            </div>
          </div>

          {/* Growth Timeline Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">6-Month Growth Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#666666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666666" style={{ fontSize: "12px" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="#EA4335"
                  strokeWidth={3}
                  name="Height %ile"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#FBBC05"
                  strokeWidth={3}
                  name="Weight %ile"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* X-Ray Series */}
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">X-Ray Bone Age Series</h3>
            <div className="space-y-3">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1A1A1A]">January 2026</p>
                    <p className="text-sm text-[#666666]">22mo bone age (24mo chronological)</p>
                  </div>
                  <Camera className="w-6 h-6 text-[#1A73E8]" />
                </div>
                <div className="bg-[#F8F9FA] h-32 rounded-xl flex items-center justify-center">
                  <p className="text-[#999999]">X-Ray Image Placeholder</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1A1A1A]">July 2026</p>
                    <p className="text-sm text-[#666666]">28mo bone age (30mo chronological)</p>
                  </div>
                  <Camera className="w-6 h-6 text-[#1A73E8]" />
                </div>
                <div className="bg-[#F8F9FA] h-32 rounded-xl flex items-center justify-center">
                  <p className="text-[#999999]">X-Ray Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>

          {/* WHO Growth Standards */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">WHO Growth Standards</h3>
            <p className="text-white/90 text-sm">
              Growth patterns compared against World Health Organization standards for age and gender.
              Current trajectory indicates need for endocrinology consultation.
            </p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate(`/results/${patient.id}`)}>
            Return to Risk Assessment
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, ThumbsUp, ThumbsDown, AlertCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";

export function TrainingFeedback() {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [confidenceSlider, setConfidenceSlider] = useState(85);

  const improvementData = [
    { month: "Oct", error: 6.2, auroc: 0.951 },
    { month: "Nov", error: 5.4, auroc: 0.962 },
    { month: "Dec", error: 4.8, auroc: 0.969 },
    { month: "Jan", error: 4.2, auroc: 0.971 },
    { month: "Feb", error: 3.8, auroc: 0.976 },
  ];

  const caseReview = {
    id: "CHW-001",
    age: "24mo",
    gender: "F",
    prediction: "REFERRAL",
    mdDiagnosis: "REFERRAL",
    confidence: 97.3,
  };

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/validation-dashboard")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">AI Training Feedback</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8" />
              <h2 className="text-xl font-bold">Live Learning System</h2>
            </div>
            <p className="text-white/90">Your feedback helps 10,000+ children monthly</p>
          </div>

          {/* Case Review Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">CASE REVIEW</h3>
            
            <div className="bg-[#F8F9FA] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">
                    {caseReview.id} • {caseReview.age} {caseReview.gender}
                  </h4>
                  <p className="text-sm text-[#666666] mt-1">
                    Speech regression, no 50+ words
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#666666]">Confidence</p>
                  <p className="text-xl font-bold text-[#34A853]">{caseReview.confidence}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border-2 border-[#EA4335]">
                  <p className="text-xs text-[#666666] mb-1">PediScreen</p>
                  <p className="font-bold text-[#EA4335]">{caseReview.prediction}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-[#34A853]">
                  <p className="text-xs text-[#666666] mb-1">MD Diagnosis</p>
                  <p className="font-bold text-[#34A853]">{caseReview.mdDiagnosis}</p>
                </div>
              </div>

              {caseReview.prediction === caseReview.mdDiagnosis && (
                <div className="mt-3 flex items-center gap-2 text-[#34A853]">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">Diagnosis Match ✓</span>
                </div>
              )}
            </div>

            {/* Feedback Form */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-[#1A1A1A] mb-3">This diagnosis was...</h4>
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    className={`h-[72px] rounded-xl flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedRating === "perfect"
                        ? "bg-[#34A853] border-[#34A853] text-white"
                        : "bg-white border-gray-200 text-[#666666]"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRating("perfect")}
                  >
                    <ThumbsUp className="w-6 h-6" />
                    <span className="text-xs font-semibold">Perfect</span>
                  </motion.button>

                  <motion.button
                    className={`h-[72px] rounded-xl flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedRating === "slight"
                        ? "bg-[#FBBC05] border-[#FBBC05] text-white"
                        : "bg-white border-gray-200 text-[#666666]"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRating("slight")}
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-xs font-semibold">Slightly Off</span>
                  </motion.button>

                  <motion.button
                    className={`h-[72px] rounded-xl flex flex-col items-center justify-center gap-2 border-2 ${
                      selectedRating === "wrong"
                        ? "bg-[#EA4335] border-[#EA4335] text-white"
                        : "bg-white border-gray-200 text-[#666666]"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRating("wrong")}
                  >
                    <ThumbsDown className="w-6 h-6" />
                    <span className="text-xs font-semibold">Wrong</span>
                  </motion.button>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <h4 className="font-bold text-[#1A1A1A]">Your Confidence</h4>
                  <span className="font-bold text-[#1A73E8]">{confidenceSlider}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceSlider}
                  onChange={(e) => setConfidenceSlider(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1A73E8 ${confidenceSlider}%, #E0E0E0 ${confidenceSlider}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-[#666666] mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Improvement Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">MODEL IMPROVEMENT</h3>
            <p className="text-sm text-[#666666] mb-4">
              Based on CHW feedback over 5 months
            </p>
            
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#666666" style={{ fontSize: "11px" }} />
                <YAxis
                  yAxisId="left"
                  domain={[0, 10]}
                  stroke="#EA4335"
                  style={{ fontSize: "11px" }}
                  label={{ value: "Error %", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0.94, 1.0]}
                  stroke="#1A73E8"
                  style={{ fontSize: "11px" }}
                  label={{ value: "AUROC", angle: 90, position: "insideRight" }}
                />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="error"
                  stroke="#EA4335"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Error Rate (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="auroc"
                  stroke="#1A73E8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="AUROC"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-around mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#EA4335] rounded"></div>
                <span className="text-[#666666]">Error: 6.2% → 3.8%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#1A73E8] rounded"></div>
                <span className="text-[#666666]">AUROC: 0.951 → 0.976</span>
              </div>
            </div>
          </div>

          {/* Impact Message */}
          <div className="bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Your Impact</h3>
            <p className="text-3xl font-bold mb-2">+247</p>
            <p className="text-white/90 text-sm">
              Feedback submissions • Helping improve accuracy for 10,000+ monthly screenings
            </p>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton
            onClick={() => navigate("/ai-predictions")}
            disabled={!selectedRating}
          >
            SUBMIT FEEDBACK
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

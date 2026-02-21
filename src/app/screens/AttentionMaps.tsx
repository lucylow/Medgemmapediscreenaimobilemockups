import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Eye, Brain } from "lucide-react";
import { motion } from "motion/react";

export function AttentionMaps() {
  const navigate = useNavigate();

  const attentionWeights = [
    { word: "regression", weight: 0.34, color: "#EA4335", description: "Developmental milestone loss" },
    { word: "no 50+", weight: 0.28, color: "#FF4444", description: "Vocabulary deficit (24mo)" },
    { word: "points", weight: 0.19, color: "#FF9800", description: "Joint attention concern" },
    { word: "15 words", weight: 0.12, color: "#FBBC05", description: "Below age expectation" },
    { word: "combinations", weight: 0.07, color: "#FDD835", description: "Syntax development" },
  ];

  const riskContributions = [
    { factor: "Speech delay", contribution: 62, color: "#EA4335" },
    { factor: "Joint attention", contribution: 24, color: "#FF9800" },
    { factor: "Vocabulary", contribution: 14, color: "#FBBC05" },
  ];

  return (
    <MobileContainer>
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/who-growth")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">AI Explainability</h1>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8" />
              <h2 className="text-xl font-bold">MedGemma Attention Visualization</h2>
            </div>
            <p className="text-white/90 text-sm">
              Understanding which input features drive the AI's clinical decision
            </p>
          </div>

          {/* Input Text */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#1A73E8]" />
              INPUT TEXT
            </h3>
            <p className="text-[#666666] italic">
              "Child says 15 words, no combinations, regression noted, points instead of speaking, age 24 months"
            </p>
          </div>

          {/* Attention Heatmap */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">ATTENTION WEIGHTS</h3>
            <p className="text-sm text-[#666666] mb-4">
              Red = High Risk Features • Yellow = Moderate Concern
            </p>
            
            <div className="space-y-3">
              {attentionWeights.map((item, index) => (
                <motion.div
                  key={item.word}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-4 py-2 rounded-lg font-bold text-white text-sm"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.word}
                      </span>
                      <span className="text-[#666666] text-sm">← {item.weight.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#999999] ml-2">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Risk Contribution Breakdown */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">RISK CONTRIBUTION BREAKDOWN</h3>
            
            <div className="space-y-4">
              {riskContributions.map((item, index) => (
                <motion.div
                  key={item.factor}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1A1A1A]">{item.factor}</span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.contribution}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.contribution}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 bg-[#F8F9FA] rounded-xl p-4">
              <p className="text-sm text-[#666666] italic">
                "AI focused on <span className="font-bold text-[#EA4335]">CRITICAL speech regression markers</span> with 62% contribution to final REFERRAL decision"
              </p>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div className="bg-gradient-to-br from-[#34A853] to-[#1A73E8] rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">Clinical Interpretation</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Model correctly identified speech regression as primary concern</li>
              <li>✓ Vocabulary deficit (15 vs 50+ words) flagged appropriately</li>
              <li>✓ Joint attention issues (pointing behavior) noted</li>
              <li>✓ Age-appropriate context (24mo) factored into decision</li>
            </ul>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate("/feature-importance")}>
            View SHAP Values
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Brain, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function LiveInference() {
  const navigate = useNavigate();
  const [inferenceTime, setInferenceTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Simulate inference process
    const interval = setInterval(() => {
      setInferenceTime((prev) => {
        if (prev >= 2.847) {
          clearInterval(interval);
          setTimeout(() => {
            setProcessing(false);
            setTimeout(() => navigate("/asq3-dashboard"), 1500);
          }, 500);
          return 2.847;
        }
        return prev + 0.05;
      });

      setConfidence((prev) => {
        if (prev >= 97.3) return 97.3;
        return Math.min(prev + 1.2, 97.3);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigate]);

  const highlightedWords = [
    { text: "regression", weight: 0.34, color: "#EA4335" },
    { text: "no 50+", weight: 0.28, color: "#FF4444" },
    { text: "points", weight: 0.19, color: "#FF9800" },
    { text: "15 words", weight: 0.12, color: "#FBBC05" },
  ];

  return (
    <MobileContainer className="bg-gradient-to-b from-[#1A73E8] to-[#9C27B0]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/behavioral-analysis")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">LIVE INFERENCE</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Hero Animation */}
          <motion.div
            className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Brain className="w-16 h-16 text-white" />
            <motion.div
              className="absolute inset-0 border-4 border-white/50 rounded-full"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            MedGemma-4B Processing
          </h2>
          <p className="text-white/90 text-lg mb-8">24mo Communication Screening</p>

          {/* Inference Counter */}
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6 mb-8">
            <motion.div
              className="text-6xl font-bold text-white text-center"
              key={inferenceTime}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              {inferenceTime.toFixed(3)}s
            </motion.div>
            <p className="text-white/80 text-center mt-2">Inference Time</p>
          </div>

          {/* Confidence Building */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex justify-between text-white mb-2">
              <span>Confidence Building...</span>
              <span className="font-bold">{confidence.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FBBC05] via-[#FF9800] to-[#34A853] rounded-full"
                style={{ width: `${confidence}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Prompt Preview */}
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#FBBC05]" />
              <h3 className="font-bold text-white">PROMPT PREVIEW</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              "ASQ-3 24mo: 15 words vs 50+ expected..."
            </p>

            {/* Attention Map */}
            <div className="bg-black/30 rounded-xl p-4">
              <h4 className="text-white text-xs font-bold mb-2">ATTENTION WEIGHTS</h4>
              <div className="space-y-2">
                {highlightedWords.map((word, index) => (
                  <motion.div
                    key={word.text}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3 }}
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-lg font-semibold text-sm"
                        style={{ backgroundColor: word.color, color: 'white' }}
                      >
                        {word.text}
                      </span>
                      <span className="text-white/60 text-xs">← {word.weight.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {!processing && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-[#34A853] text-xl font-bold text-center">
                ✓ Analysis Complete
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

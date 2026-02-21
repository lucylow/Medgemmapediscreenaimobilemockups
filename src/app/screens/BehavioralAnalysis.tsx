import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { milestones } from "../data/mockData";

export function BehavioralAnalysis() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showMilestones, setShowMilestones] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setShowMilestones(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setComplete(true);
    setTimeout(() => navigate("/results/CHW-001"), 1000);
  };

  return (
    <MobileContainer className="bg-gradient-to-b from-[#1A73E8] to-[#34A853]">
      <div className="h-full relative">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/camera-screening")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Behavioral Analysis</h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="h-full flex flex-col items-center justify-center px-6">
          {analyzing && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto">
                <motion.div
                  className="w-24 h-24 border-8 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Analyzing...</h2>
              <p className="text-white/90 text-lg mb-6">ASQ-3 Behavioral Camera</p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-xs bg-white/20 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white text-sm mt-2">{progress}%</p>

              {/* Live Metrics */}
              <div className="mt-8 space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-white/70 text-sm">Live Joint Attention</p>
                  <p className="text-white text-2xl font-bold">84%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-white/70 text-sm">Head Lag Test</p>
                  <p className="text-[#34A853] text-2xl font-bold">PASS ✓</p>
                </div>
              </div>
            </motion.div>
          )}

          {showMilestones && !complete && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Milestone Checklist
              </h2>

              <div className="space-y-4 mb-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-2xl p-5 flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {milestone.achieved ? (
                      <CheckCircle2 className="w-8 h-8 text-[#34A853] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-[#EA4335] flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${milestone.achieved ? 'text-[#1A1A1A]' : 'text-[#EA4335]'}`}>
                        {milestone.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <PrimaryButton onClick={handleComplete}>
                  Analyze with MedGemma
                </PrimaryButton>
              </div>
            </motion.div>
          )}

          {complete && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle2 className="w-20 h-20 text-[#34A853]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Analysis Complete!</h2>
              <p className="text-white/90 text-lg">Generating risk assessment...</p>
            </motion.div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

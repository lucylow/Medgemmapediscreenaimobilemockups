import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { Brain, Cpu, Database, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function ModelLoading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loadedMB, setLoadedMB] = useState(0);
  const totalMB = 2800;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate("/model-ready"), 1000);
          return 100;
        }
        return prev + 2;
      });
      setLoadedMB((prev) => Math.min(prev + 56, totalMB));
    }, 90);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <MobileContainer className="bg-gradient-to-b from-[#1A73E8] to-[#34A853]">
      <div className="h-full flex flex-col items-center justify-center px-6">
        {/* Hero Animation */}
        <motion.div
          className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-20 h-20 text-white" />
          <motion.div
            className="absolute inset-0 border-4 border-white border-t-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          MedGemma-4B-IT-Q4
        </h1>
        <p className="text-white/90 text-lg mb-8">2.8GB Pediatric Model Loading...</p>

        {/* Progress Circle */}
        <div className="relative w-48 h-48 mb-8">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="white"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white">{progress}%</span>
            <span className="text-white/80 text-sm mt-2">
              {loadedMB.toFixed(0)}MB / {totalMB}MB
            </span>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="w-full max-w-sm space-y-3 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Cpu className={`w-6 h-6 ${progress >= 30 ? 'text-[#34A853]' : 'text-white/50'}`} />
            <span className="text-white flex-1">TensorFlow.js WebGL Backend</span>
            {progress >= 30 && <span className="text-[#34A853]">✓</span>}
          </div>
          <div className="flex items-center gap-3">
            <Database className={`w-6 h-6 ${progress >= 60 ? 'text-[#34A853]' : 'text-white/50'}`} />
            <span className="text-white flex-1">KV Cache Initialized</span>
            {progress >= 60 && <span className="text-[#34A853]">✓</span>}
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className={`w-6 h-6 ${progress >= 90 ? 'text-[#34A853]' : 'text-white/50'}`} />
            <span className="text-white flex-1">Medical Tokenizer</span>
            {progress >= 90 && <span className="text-[#34A853]">✓</span>}
          </div>
        </div>

        {/* Expected Time */}
        <p className="text-white/80 mt-8">
          iPhone 15 Pro: 2.8s inference ready in {Math.max(0, 45 - Math.floor(progress / 2.2))}s
        </p>
      </div>
    </MobileContainer>
  );
}

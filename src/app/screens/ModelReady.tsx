import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { Brain, Cpu, Database, Zap, TrendingUp, Activity } from "lucide-react";
import { motion } from "motion/react";

export function ModelReady() {
  const navigate = useNavigate();

  const metrics = [
    {
      title: "INFERENCE ENGINE",
      icon: Cpu,
      items: [
        "Backend: WebGL",
        "Context: 8K tokens",
        "Quantization: Q4_K_M"
      ]
    },
    {
      title: "MEMORY USAGE",
      icon: Database,
      items: [
        "Peak: 3.8GB/8GB",
        "Available: 4.2GB",
        "Cache Hit: 87%"
      ]
    },
    {
      title: "PERFORMANCE",
      icon: Zap,
      items: [
        "Last Inference: 2.8s",
        "Confidence: 97.3%",
        "Memory Peak: 3.8GB"
      ]
    },
    {
      title: "PEDIATRIC DATA",
      icon: TrendingUp,
      items: [
        "ASQ-3 r=0.962",
        "Bone Age: ±4mo",
        "Growth Z=±0.2"
      ]
    }
  ];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        {/* Hero Banner */}
        <motion.div
          className="bg-gradient-to-r from-[#34A853] to-[#1A73E8] px-6 py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MODEL READY</h1>
              <p className="text-white/90">MedGemma-4B-IT-Q4</p>
            </div>
          </div>
          
          {/* Live Status */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
            <motion.div
              className="w-3 h-3 bg-white rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-white font-semibold">Live Inference Ready</span>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">LIVE METRICS</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.title}
                className="bg-white border-2 border-gray-200 rounded-2xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <metric.icon className="w-5 h-5 text-[#1A73E8]" />
                  <h3 className="text-xs font-bold text-[#666666]">{metric.title}</h3>
                </div>
                <div className="space-y-1">
                  {metric.items.map((item, i) => (
                    <p key={i} className="text-sm text-[#1A1A1A]">• {item}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Model Info */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#9C27B0] rounded-2xl p-6 text-white mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Model Specifications
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Model Size</span>
                <span className="font-bold">2.8GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Parameters</span>
                <span className="font-bold">4B (Quantized)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Context Window</span>
                <span className="font-bold">8,192 tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Avg Response Time</span>
                <span className="font-bold text-[#34A853]">2.8s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Clinical Validation</span>
                <span className="font-bold text-[#FBBC05]">AUC 0.976</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton onClick={() => navigate("/dashboard")}>
            START SCREENING
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

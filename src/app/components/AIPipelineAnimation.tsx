import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PIPELINE_STEPS } from "../rop/ropTypes";

interface Props {
  progress: number;
  modelSize?: number;
  memoryUsage?: number;
  completed?: boolean;
  latencyMs?: number;
}

export function AIPipelineAnimation({
  progress,
  modelSize = 450,
  memoryUsage = 320,
  completed = false,
  latencyMs,
}: Props) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 border border-gray-200">
      <div className="text-center mb-6">
        {completed ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-[#202124]">Analysis Complete</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-[#1A73E8] animate-spin" />
            <span className="text-lg font-bold text-[#202124]">MedGemma Processing</span>
          </div>
        )}
        {latencyMs && completed && (
          <p className="text-xs text-[#5f6368] mt-1">Completed in {(latencyMs / 1000).toFixed(1)}s</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {PIPELINE_STEPS.map((step, idx) => {
          const stepStart = idx * 0.25;
          const stepEnd = stepStart + 0.25;
          const stepProgress = Math.max(0, Math.min(1, (animatedProgress - stepStart) / 0.25));
          const isActive = animatedProgress >= stepStart && animatedProgress < stepEnd;
          const isDone = animatedProgress >= stepEnd;

          return (
            <div key={step.name} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${
                  isDone
                    ? "bg-green-100"
                    : isActive
                    ? "bg-blue-100"
                    : "bg-gray-100"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${
                    isDone ? "text-green-700" : isActive ? "text-[#1A73E8]" : "text-[#5f6368]"
                  }`}>
                    {step.name}
                  </span>
                  <span className="text-xs text-[#5f6368] font-mono">{step.time}s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: step.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stepProgress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-[#5f6368]">Model</p>
          <p className="font-mono text-sm font-semibold text-[#202124]">{modelSize}MB</p>
        </div>
        <div>
          <p className="text-xs text-[#5f6368]">RAM</p>
          <p className="font-mono text-sm font-semibold text-[#202124]">{memoryUsage}MB</p>
        </div>
        <div>
          <p className="text-xs text-[#5f6368]">Efficiency</p>
          <p className="font-mono text-sm font-semibold text-[#202124]">
            {Math.round((modelSize / memoryUsage) * 100)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5f6368]">Layers</p>
          <p className="font-mono text-sm font-semibold text-[#202124]">4/4</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Eye } from "lucide-react";
import { motion } from "motion/react";

export function ROPCamera() {
  const navigate = useNavigate();
  const [quality, setQuality] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);

  const startCapture = () => {
    setCapturing(true);
    let q = 0;
    const interval = setInterval(() => {
      q += 5;
      setQuality(q);
      if (q >= 92) {
        clearInterval(interval);
        setTimeout(() => {
          setCaptured(true);
          setTimeout(() => navigate("/results/CHW-023"), 1500);
        }, 500);
      }
    }, 100);
  };

  return (
    <MobileContainer className="bg-black">
      <div className="h-full relative">
        {/* Camera View Simulation */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-red-900/20 to-black">
          {/* Live Quality Indicator */}
          <div className="absolute top-24 right-6 z-20">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke={quality >= 90 ? "#34A853" : quality >= 70 ? "#FBBC05" : "#EA4335"}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - quality / 100)}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 32 * (1 - quality / 100)}` }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{quality}%</span>
              </div>
            </div>
            <p className="text-white text-xs text-center mt-2">Quality</p>
          </div>

          {/* ROP Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-80 h-80">
              {/* Optimal Zone Box */}
              <motion.div
                className="absolute inset-0 border-4 rounded-full"
                style={{
                  borderColor: quality >= 90 ? "#34A853" : quality >= 70 ? "#FBBC05" : "#EA4335",
                }}
                animate={capturing ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: capturing ? Infinity : 0 }}
              >
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-white/30"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-white/30"></div>
                </div>

                {/* Eye Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="w-24 h-24 text-white/30" />
                </div>

                {/* Zone Markers */}
                {quality >= 70 && (
                  <>
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-[#FF9800] text-xs font-bold bg-black/50 px-2 py-1 rounded">
                      Zone II
                    </div>
                    {quality >= 90 && (
                      <div className="absolute top-1/3 right-1/4 text-[#EA4335] text-xs font-bold bg-black/50 px-2 py-1 rounded">
                        Stage 2
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="absolute bottom-40 inset-x-0 text-center px-6">
            <p className="text-white text-xl font-semibold">
              {captured
                ? "Capture Complete!"
                : quality >= 90
                ? "Optimal Positioning ✓"
                : quality >= 70
                ? "Good - Hold Steady"
                : capturing
                ? "Positioning..."
                : "Align pupil in center"}
            </p>
            {captured && (
              <p className="text-[#34A853] text-lg mt-2">Analyzing with MedGemma...</p>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/camera-screening")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ROP Camera</h1>
          <div className="w-10"></div>
        </div>

        {/* Action Zone */}
        <div className="absolute bottom-0 inset-x-0 px-6 py-6">
          {!capturing && !captured && (
            <PrimaryButton onClick={startCapture}>
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 bg-white rounded-full"></div>
                Capture
              </div>
            </PrimaryButton>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

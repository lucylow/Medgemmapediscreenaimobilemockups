import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Eye, Settings, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import type { ImageQualityMetrics, ROPMetadata } from "../rop/ropTypes";
import { generateMockImageQuality, analyzeROPFrame } from "../rop/ropMockService";

type CameraState = "setup" | "live" | "capturing" | "analyzing" | "done";

export function ROPCamera() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>("setup");
  const [quality, setQuality] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState<ImageQualityMetrics>({
    pupilDilation: 0, focusSharpness: 0, lightingEvenness: 0, vascularContrast: 0, overall: 0,
  });
  const [gestationalAge, setGestationalAge] = useState(28);
  const [postMenstrualAge, setPostMenstrualAge] = useState(36);
  const [hasCamera, setHasCamera] = useState(true);
  const qualityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraState("live");
      hapticImpact("light");

      qualityIntervalRef.current = setInterval(() => {
        const metrics = generateMockImageQuality();
        setQualityMetrics(metrics);
        setQuality(metrics.overall);
      }, 800);
    } catch {
      setHasCamera(false);
      setCameraState("live");

      qualityIntervalRef.current = setInterval(() => {
        const metrics = generateMockImageQuality();
        setQualityMetrics(metrics);
        setQuality(metrics.overall);
      }, 800);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (quality < 75) {
      hapticNotification("warning");
      return;
    }

    setCameraState("capturing");
    hapticImpact("heavy");
    if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);

    let q = quality;
    const rampInterval = setInterval(() => {
      q = Math.min(98, q + 2);
      setQuality(q);
      if (q >= 98) clearInterval(rampInterval);
    }, 80);

    await new Promise((res) => setTimeout(res, 1500));
    clearInterval(rampInterval);
    setQuality(98);

    setCameraState("analyzing");

    const metadata: ROPMetadata = {
      gestationalAge,
      postMenstrualAge,
      quality: 98,
    };

    try {
      const result = await analyzeROPFrame(metadata);
      hapticNotification("success");
      setCameraState("done");

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }

      setTimeout(() => {
        navigate("/rop-results", { state: { result, metadata } });
      }, 800);
    } catch {
      hapticNotification("error");
      setCameraState("live");
    }
  };

  const qualityColor = quality >= 90 ? "#34A853" : quality >= 75 ? "#FBBC05" : "#EA4335";

  return (
    <MobileContainer className="bg-black">
      <div className="h-full relative">
        {cameraState === "setup" ? (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black">
            <Eye className="w-16 h-16 text-white/30 mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">ROP Camera Setup</h2>
            <p className="text-sm text-white/60 text-center mb-8">
              Configure patient metadata before starting the live ROP screening session.
            </p>

            <div className="w-full max-w-sm space-y-4">
              <div className="bg-white/10 rounded-2xl p-4">
                <label className="text-xs text-white/60 block mb-2">Gestational Age (weeks)</label>
                <input
                  type="range"
                  min={22}
                  max={37}
                  value={gestationalAge}
                  onChange={(e) => setGestationalAge(parseInt(e.target.value))}
                  className="w-full accent-[#1A73E8]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>22w (extreme preterm)</span>
                  <span className="font-bold text-white/80">{gestationalAge}w</span>
                  <span>37w</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <label className="text-xs text-white/60 block mb-2">Post-Menstrual Age (weeks)</label>
                <input
                  type="range"
                  min={28}
                  max={52}
                  value={postMenstrualAge}
                  onChange={(e) => setPostMenstrualAge(parseInt(e.target.value))}
                  className="w-full accent-[#1A73E8]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>28w</span>
                  <span className="font-bold text-white/80">{postMenstrualAge}w</span>
                  <span>52w</span>
                </div>
              </div>

              <PrimaryButton onClick={startCamera}>
                <div className="flex items-center justify-center gap-3">
                  <Eye className="w-5 h-5" />
                  Start ROP Camera
                </div>
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            {hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-red-900/20 to-black" />
            )}

            <div className="absolute top-0 inset-x-0 px-4 py-4 flex items-center justify-between z-10">
              <button
                onClick={() => {
                  if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
                  if (videoRef.current?.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
                  }
                  navigate(-1);
                }}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-lg font-bold text-white">ROP Live Screening</h1>
              <button
                onClick={() => {
                  if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
                  setCameraState("setup");
                }}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="absolute top-20 left-4 right-4 z-10">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-lg font-bold">Quality: {quality}%</span>
                  <span className="text-xs text-white/60">GA: {gestationalAge}w · PMA: {postMenstrualAge}w</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-white/50 text-[10px]">Pupil</p>
                    <p className="text-white/90 text-xs font-mono">
                      {(qualityMetrics.pupilDilation * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px]">Focus</p>
                    <p className="text-white/90 text-xs font-mono">
                      {(qualityMetrics.focusSharpness * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px]">Lighting</p>
                    <p className="text-white/90 text-xs font-mono">
                      {(qualityMetrics.lightingEvenness * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px]">Vascular</p>
                    <p className="text-white/90 text-xs font-mono">
                      {(qualityMetrics.vascularContrast * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-44 right-6 z-20">
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                  <motion.circle
                    cx="40" cy="40" r="32"
                    stroke={qualityColor}
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
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-72">
                <motion.div
                  className="absolute inset-0 border-4 rounded-full"
                  style={{ borderColor: qualityColor }}
                  animate={cameraState === "capturing" ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: cameraState === "capturing" ? Infinity : 0 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-white/20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-0.5 bg-white/20" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="w-20 h-20 text-white/20" />
                  </div>

                  {quality >= 70 && (
                    <>
                      <div className="absolute top-[22%] left-1/2 -translate-x-1/2 text-[#FF9800] text-xs font-bold bg-black/60 px-2 py-1 rounded">
                        Zone II
                      </div>
                      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded">
                        Zone I
                      </div>
                      {quality >= 85 && (
                        <div className="absolute top-[32%] right-[18%] text-[#EA4335] text-xs font-bold bg-black/60 px-2 py-1 rounded">
                          Stage 2
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-36 inset-x-0 text-center px-6 z-10">
              <p className="text-white text-xl font-semibold">
                {cameraState === "done"
                  ? "Analysis Complete!"
                  : cameraState === "analyzing"
                  ? "Analyzing with MedGemma..."
                  : cameraState === "capturing"
                  ? "Capturing 10s Sequence..."
                  : quality >= 90
                  ? "Optimal Positioning"
                  : quality >= 75
                  ? "Good - Hold Steady"
                  : "Align pupil in center"}
              </p>
              {cameraState === "analyzing" && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Loader2 className="w-5 h-5 text-[#1A73E8] animate-spin" />
                  <p className="text-[#1A73E8] text-sm">Zone/Stage/Plus classification...</p>
                </div>
              )}
              {cameraState === "done" && (
                <p className="text-[#34A853] text-lg mt-2">Navigating to results...</p>
              )}
            </div>

            <div className="absolute bottom-0 inset-x-0 px-6 py-6 z-10">
              {cameraState === "live" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCapture}
                  disabled={quality < 75}
                  className={`w-full h-20 rounded-full flex items-center justify-center gap-3 text-white text-lg font-bold shadow-2xl ${
                    quality >= 75
                      ? "bg-[#1A73E8] border-4 border-white"
                      : "bg-gray-600 border-4 border-gray-400"
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full" />
                  {quality >= 75 ? "ANALYZE" : `Quality ${quality}% (need 75%+)`}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </MobileContainer>
  );
}

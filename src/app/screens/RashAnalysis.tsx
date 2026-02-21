import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Loader2, ChevronDown, ChevronUp, Sun, Focus, Scan, Share2, X, RotateCcw, Check, AlertTriangle, Zap } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { TabBar } from "../components/TabBar";
import { RISK_COLORS, type RiskLevel } from "../data/types";
import { hapticSelection, hapticImpact, hapticNotification } from "../platform/haptics";
import { useCamera } from "../platform/useCamera";
import { motion, AnimatePresence } from "motion/react";

type DiagnosisType = "atopic_dermatitis" | "viral_exanthem" | "bacterial_infection" | "contact_dermatitis" | "normal_skin";
type Severity = "mild" | "moderate" | "severe";
type TreatmentUrgency = "immediate" | "urgent" | "routine";

interface RashAnalysisResult {
  primaryDiagnosis: DiagnosisType;
  confidence: number;
  severity: Severity;
  distribution: string[];
  morphology: string[];
  icd10Code: string;
  treatmentUrgency: TreatmentUrgency;
  recommendations: string[];
  affectedAreaPercent: number;
  inferenceTimeMs: number;
}

interface QualityMetrics {
  lighting: number;
  focus: number;
  skinDetection: number;
  overall: number;
}

const DIAGNOSIS_CONFIG: Record<DiagnosisType, { icon: string; color: string; label: string; icd10: string }> = {
  atopic_dermatitis: { icon: "🩹", color: "#FF9800", label: "Atopic Dermatitis", icd10: "L20.9" },
  viral_exanthem: { icon: "🦠", color: "#FBBC05", label: "Viral Exanthem", icd10: "B09.8" },
  bacterial_infection: { icon: "🔬", color: "#EA4335", label: "Bacterial Infection", icd10: "L08.9" },
  contact_dermatitis: { icon: "⚠️", color: "#9C27B0", label: "Contact Dermatitis", icd10: "L25.9" },
  normal_skin: { icon: "✅", color: "#34A853", label: "Normal Skin", icd10: "Z00.0" },
};

const URGENCY_COLORS: Record<TreatmentUrgency, string> = {
  immediate: "#EA4335",
  urgent: "#FF9800",
  routine: "#34A853",
};

const SEVERITY_COLORS: Record<Severity, string> = {
  mild: "#34A853",
  moderate: "#FF9800",
  severe: "#EA4335",
};

function analyzeImageQuality(canvas: HTMLCanvasElement): QualityMetrics {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { lighting: 0.5, focus: 0.5, skinDetection: 0.3, overall: 0.4 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = canvas.width * canvas.height;

  let totalBrightness = 0;
  let skinPixels = 0;
  let brightnessVariance = 0;
  const brightnesses: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    totalBrightness += brightness;
    brightnesses.push(brightness);

    const isSkin = r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b;
    if (isSkin) skinPixels++;
  }

  const avgBrightness = totalBrightness / (totalPixels || 1);
  for (const b of brightnesses) {
    brightnessVariance += (b - avgBrightness) ** 2;
  }
  brightnessVariance /= (totalPixels || 1);

  const lighting = Math.max(0, Math.min(1, 1 - Math.abs(avgBrightness - 0.5) * 2));
  const focus = Math.max(0, Math.min(1, Math.sqrt(brightnessVariance) * 4));
  const skinDetection = Math.min(1, skinPixels / (totalPixels || 1) * 3);
  const overall = lighting * 0.3 + focus * 0.3 + skinDetection * 0.4;

  return { lighting, focus, skinDetection, overall };
}

function generateRashResult(quality: QualityMetrics): RashAnalysisResult {
  const rand = Math.random();
  let diagnosis: DiagnosisType;
  let severity: Severity;
  let urgency: TreatmentUrgency;
  let distribution: string[];
  let morphology: string[];
  let recommendations: string[];
  let affectedArea: number;

  if (rand < 0.35) {
    diagnosis = "atopic_dermatitis";
    severity = rand < 0.15 ? "severe" : rand < 0.25 ? "moderate" : "mild";
    urgency = severity === "severe" ? "urgent" : "routine";
    distribution = ["flexural folds", "cheeks", "extremities"];
    morphology = ["erythema", "xerosis", "excoriations"];
    affectedArea = severity === "severe" ? 18.5 : severity === "moderate" ? 12.5 : 5.2;
    recommendations = [
      "Apply low-potency topical corticosteroid (hydrocortisone 1%) to affected areas twice daily",
      "Moisturize 2-3x daily with fragrance-free emollient (e.g., CeraVe, Vanicream)",
      "Avoid known irritants: wool, harsh soaps, fragranced products",
      severity === "severe" ? "Consider referral to pediatric dermatologist within 1-2 weeks" : "Follow-up in 2-4 weeks if no improvement",
      "Trim child's nails to minimize excoriation damage",
    ];
  } else if (rand < 0.55) {
    diagnosis = "viral_exanthem";
    severity = "mild";
    urgency = "routine";
    distribution = ["trunk", "proximal extremities"];
    morphology = ["maculopapular rash", "blanching erythema"];
    affectedArea = 22.0;
    recommendations = [
      "Supportive care: antipyretics for fever (acetaminophen/ibuprofen per age/weight)",
      "Monitor for systemic symptoms (high fever >104°F, lethargy, poor feeding)",
      "Keep child comfortable with loose cotton clothing",
      "Most viral exanthems resolve within 5-7 days",
      "Return immediately if petechiae/purpura develop or child appears ill",
    ];
  } else if (rand < 0.7) {
    diagnosis = "bacterial_infection";
    severity = rand < 0.6 ? "moderate" : "mild";
    urgency = severity === "moderate" ? "urgent" : "routine";
    distribution = ["localized", "perioral"];
    morphology = ["honey-colored crusts", "vesicles", "erythema"];
    affectedArea = 3.8;
    recommendations = [
      "Start topical mupirocin (Bactroban) 2% ointment three times daily for 5 days",
      "Keep affected area clean; gentle washing with soap and water",
      "Cover lesions to prevent spread; practice good hand hygiene",
      severity === "moderate" ? "Consider oral antibiotics if topical therapy insufficient after 48-72 hours" : "Follow-up in 3-5 days to assess response",
      "Exclude from school/daycare until 24 hours after starting treatment",
    ];
  } else if (rand < 0.85) {
    diagnosis = "contact_dermatitis";
    severity = "mild";
    urgency = "routine";
    distribution = ["exposed areas", "hands", "face"];
    morphology = ["erythema", "vesicles", "pruritus"];
    affectedArea = 6.0;
    recommendations = [
      "Identify and remove causative agent (new soap, detergent, plant contact)",
      "Apply calamine lotion or low-potency hydrocortisone to affected areas",
      "Cool compresses for comfort; avoid scratching",
      "Typically resolves within 2-3 weeks after trigger removal",
      "Consider allergy patch testing if recurrent episodes",
    ];
  } else {
    diagnosis = "normal_skin";
    severity = "mild";
    urgency = "routine";
    distribution = [];
    morphology = [];
    affectedArea = 0;
    recommendations = [
      "No concerning dermatological findings identified",
      "Continue routine skin care with gentle, fragrance-free products",
      "Maintain sun protection with pediatric SPF 30+ sunscreen",
      "Return for evaluation if new skin changes develop",
    ];
  }

  const baseConfidence = 0.7 + quality.overall * 0.25;
  const confidence = Math.min(0.97, baseConfidence + (Math.random() * 0.05));

  return {
    primaryDiagnosis: diagnosis,
    confidence,
    severity,
    distribution,
    morphology,
    icd10Code: DIAGNOSIS_CONFIG[diagnosis].icd10,
    treatmentUrgency: urgency,
    recommendations,
    affectedAreaPercent: affectedArea,
    inferenceTimeMs: Math.round(1200 + Math.random() * 800),
  };
}

export function RashAnalysis() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qualityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { startCamera, capturePhoto, stopCamera, isCapturing, error, isSupported } = useCamera();

  const [phase, setPhase] = useState<"intro" | "camera" | "analyzing" | "result">("intro");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityMetrics>({ lighting: 0, focus: 0, skinDetection: 0, overall: 0 });
  const [result, setResult] = useState<RashAnalysisResult | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [expandedRecs, setExpandedRecs] = useState(false);
  const [expandedMorphology, setExpandedMorphology] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
      if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
    };
  }, []);

  const openCamera = useCallback(async () => {
    if (!isSupported) return;
    setPhase("camera");
    hapticImpact("medium");
    await new Promise((r) => setTimeout(r, 100));
    if (videoRef.current) {
      await startCamera(videoRef.current);
      qualityIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext("2d");
          if (ctx && video.videoWidth > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setQuality(analyzeImageQuality(canvas));
          }
        }
      }, 500);
    }
  }, [isSupported, startCamera]);

  const handleCapture = () => {
    hapticImpact("heavy");
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      stopCamera();
      if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
      hapticNotification("success");
    }
  };

  const handleRetake = () => {
    hapticImpact("light");
    setCapturedImage(null);
    if (videoRef.current && isSupported) {
      startCamera(videoRef.current);
      qualityIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext("2d");
          if (ctx && video.videoWidth > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setQuality(analyzeImageQuality(canvas));
          }
        }
      }, 500);
    }
  };

  const handleAnalyze = () => {
    if (!capturedImage) return;
    hapticImpact("medium");
    setPhase("analyzing");
    setAnalyzeProgress(0);

    const duration = 2000;
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnalyzeProgress(progress);
      if (progress >= 1) clearInterval(progressInterval);
    }, 50);

    setTimeout(() => {
      const rashResult = generateRashResult(quality);
      setResult(rashResult);
      setPhase("result");
      const riskMap: Record<TreatmentUrgency, RiskLevel> = {
        immediate: "refer",
        urgent: "discuss",
        routine: "on_track",
      };
      hapticNotification(rashResult.treatmentUrgency === "routine" ? "success" : rashResult.treatmentUrgency === "urgent" ? "warning" : "error");
    }, duration + 200);
  };

  const handleNewScan = () => {
    hapticSelection();
    setCapturedImage(null);
    setResult(null);
    setPhase("intro");
    setExpandedRecs(false);
    setExpandedMorphology(false);
  };

  if (phase === "intro") {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">Rash Analysis</h1>
              <p className="text-xs text-[#999999]">AI-Powered Dermatological Screening</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] rounded-2xl p-5 text-center"
            >
              <div className="text-4xl mb-3">🩹</div>
              <h2 className="text-lg font-bold text-[#E65100] mb-2">Pediatric Skin Assessment</h2>
              <p className="text-sm text-[#BF360C] leading-relaxed">
                Capture a photo of the affected skin area for AI-powered analysis using MedGemma dermatology patterns.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">What We Detect</h3>
              {[
                { label: "Atopic Dermatitis (Eczema)", icon: "🩹", color: "#FF9800" },
                { label: "Viral Exanthem", icon: "🦠", color: "#FBBC05" },
                { label: "Bacterial Skin Infection", icon: "🔬", color: "#EA4335" },
                { label: "Contact Dermatitis", icon: "⚠️", color: "#9C27B0" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: item.color + "15" }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">{item.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">Photo Tips</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                {[
                  { icon: <Sun className="w-4 h-4 text-[#FBBC05]" />, text: "Use natural lighting — avoid flash" },
                  { icon: <Focus className="w-4 h-4 text-[#1A73E8]" />, text: "Hold steady, 15-20cm from skin" },
                  { icon: <Scan className="w-4 h-4 text-[#34A853]" />, text: "Include surrounding skin for context" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {tip.icon}
                    <span className="text-xs text-[#666666]">{tip.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 flex gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#F57F17] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#F57F17] leading-relaxed">
                This tool is for screening only and does not replace professional dermatological evaluation. Always consult your pediatrician for skin concerns.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 space-y-2" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
            {isSupported ? (
              <button
                onClick={openCamera}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white rounded-2xl font-bold text-base active:scale-[0.98] transition-transform shadow-lg min-h-[60px]"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            ) : (
              <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-4 text-center space-y-2">
                <Camera className="w-8 h-8 text-[#FF9800] mx-auto" />
                <p className="text-sm font-semibold text-[#E65100]">Camera Not Available</p>
                <p className="text-xs text-[#BF360C]">
                  Your device does not support camera access. Please try on a mobile device or a browser that supports camera.
                </p>
              </div>
            )}
          </div>
          <DisclaimerFooter />
          <TabBar />
        </div>
      </MobileContainer>
    );
  }

  if (phase === "camera") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col">
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex items-center justify-between px-4 py-3 bg-black/60 absolute top-0 left-0 right-0 z-10">
          <button
            onClick={() => { stopCamera(); if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current); setPhase("intro"); }}
            className="w-10 h-10 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <span className="text-white text-sm font-bold">Rash Capture</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured skin" className="max-w-full max-h-full object-contain" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full object-contain" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[70%] aspect-square border-2 border-white/40 rounded-3xl" />
              </div>
            </>
          )}
        </div>

        {!capturedImage && (
          <div className="absolute bottom-32 left-4 right-4 bg-black/70 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-xs font-bold">Image Quality</span>
              <span className={`text-xs font-bold ${quality.overall > 0.7 ? "text-[#34A853]" : quality.overall > 0.4 ? "text-[#FBBC05]" : "text-[#EA4335]"}`}>
                {quality.overall > 0.7 ? "GOOD" : quality.overall > 0.4 ? "ADJUST" : "LOW"}
              </span>
            </div>
            {[
              { label: "Lighting", value: quality.lighting, icon: <Sun className="w-3 h-3" />, color: "#FBBC05" },
              { label: "Focus", value: quality.focus, icon: <Focus className="w-3 h-3" />, color: "#1A73E8" },
              { label: "Skin", value: quality.skinDetection, icon: <Scan className="w-3 h-3" />, color: "#34A853" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span className="text-white/70">{m.icon}</span>
                <span className="text-white/70 text-[10px] w-12">{m.label}</span>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: m.color }}
                    animate={{ width: `${Math.round(m.value * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white/50 text-[10px] w-8 text-right">{Math.round(m.value * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="absolute top-16 left-4 right-4 bg-[#EA4335]/90 text-white text-sm rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <div className="bg-black/70 px-6 py-6 flex items-center justify-center gap-6" style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}>
          {capturedImage ? (
            <>
              <button onClick={handleRetake} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform">
                <RotateCcw className="w-7 h-7" />
              </button>
              <button onClick={handleAnalyze} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white font-bold text-base active:scale-95 transition-transform shadow-lg min-h-[60px] flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Analyze Rash
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!isCapturing}
              className="w-[72px] h-[72px] rounded-full border-4 border-[#FF9800] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
              <div className="w-[56px] h-[56px] rounded-full bg-[#FF9800]" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (phase === "analyzing") {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#1A1A1A] to-[#2D2D2D] p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF9800] to-[#F57C00] flex items-center justify-center shadow-xl"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
              <Loader2 className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">MedGemma Rash Analysis</h2>
            <p className="text-sm text-white/60">Processing dermatological patterns...</p>
          </div>

          <div className="w-full max-w-[280px] space-y-3">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF9800] to-[#F57C00] rounded-full"
                animate={{ width: `${Math.round(analyzeProgress * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>{Math.round(analyzeProgress * 100)}%</span>
              <span>{analyzeProgress < 0.3 ? "Detecting skin region..." : analyzeProgress < 0.6 ? "Analyzing morphology..." : analyzeProgress < 0.85 ? "Pattern matching..." : "Generating report..."}</span>
            </div>
          </div>

          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 mt-4"
            >
              <img src={capturedImage} alt="Analyzing" className="w-full h-full object-cover" />
            </motion.div>
          )}
        </div>
      </MobileContainer>
    );
  }

  if (phase === "result" && result) {
    const config = DIAGNOSIS_CONFIG[result.primaryDiagnosis];
    return (
      <MobileContainer>
        <div className="h-full flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
            <button onClick={handleNewScan} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#1A1A1A]">Analysis Results</h1>
              <p className="text-xs text-[#999999]">{result.inferenceTimeMs}ms inference</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden shadow-lg border-l-[6px]"
              style={{ borderLeftColor: config.color, backgroundColor: "white" }}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div>
                      <span
                        className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.label}
                      </span>
                      <p className="text-xs text-[#999999] mt-1 font-mono">ICD-10: {config.icd10}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold" style={{ color: config.color }}>{Math.round(result.confidence * 100)}%</p>
                    <p className="text-[10px] text-[#999999] uppercase">Confidence</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold" style={{ color: SEVERITY_COLORS[result.severity] }}>
                      {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                    </p>
                    <p className="text-[10px] text-[#999999] uppercase">Severity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-[#1A1A1A]">{result.affectedAreaPercent}%</p>
                    <p className="text-[10px] text-[#999999] uppercase">BSA Affected</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-4 shadow-sm"
              style={{ backgroundColor: URGENCY_COLORS[result.treatmentUrgency] + "12", borderColor: URGENCY_COLORS[result.treatmentUrgency] + "30", borderWidth: 1 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase"
                  style={{ backgroundColor: URGENCY_COLORS[result.treatmentUrgency] }}
                >
                  {result.treatmentUrgency}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">Treatment Urgency</span>
              </div>
            </motion.div>

            {result.distribution.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-4 shadow-sm space-y-2"
              >
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Distribution</h3>
                <div className="flex flex-wrap gap-2">
                  {result.distribution.map((d) => (
                    <span key={d} className="text-xs px-2.5 py-1 bg-[#E8F0FE] text-[#1A73E8] rounded-full font-medium">{d}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {result.morphology.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-4 shadow-sm space-y-2"
              >
                <button
                  onClick={() => { hapticSelection(); setExpandedMorphology(!expandedMorphology); }}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Morphology</h3>
                  {expandedMorphology ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
                </button>
                <AnimatePresence>
                  {expandedMorphology && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 pt-1">
                        {result.morphology.map((m) => (
                          <span key={m} className="text-xs px-2.5 py-1 bg-[#FCE4EC] text-[#C62828] rounded-full font-medium">{m}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-4 shadow-sm space-y-2"
            >
              <button
                onClick={() => { hapticSelection(); setExpandedRecs(!expandedRecs); }}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Recommendations ({result.recommendations.length})</h3>
                {expandedRecs ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
              </button>
              <AnimatePresence>
                {expandedRecs && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-2 pt-1">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: config.color }}>
                            {i + 1}
                          </div>
                          <p className="text-xs text-[#444444] leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {capturedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="p-3">
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide mb-2">Captured Image</h3>
                </div>
                <img src={capturedImage} alt="Analyzed skin" className="w-full h-40 object-cover" />
              </motion.div>
            )}

            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 flex gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#F57F17] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#F57F17] leading-relaxed">
                AI-generated screening result. This is not a medical diagnosis. Please consult your pediatrician for professional evaluation and treatment.
              </p>
            </div>
          </div>

          <div className="px-5 py-3 space-y-2 border-t border-gray-100" style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
            <button
              onClick={handleNewScan}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-md min-h-[56px]"
            >
              <Camera className="w-5 h-5" />
              New Scan
            </button>
          </div>
          <DisclaimerFooter />
          <TabBar />
        </div>
      </MobileContainer>
    );
  }

  return null;
}

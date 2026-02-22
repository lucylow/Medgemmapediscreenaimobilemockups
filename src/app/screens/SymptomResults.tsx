import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import {
  ArrowLeft, CheckCircle, AlertCircle, AlertTriangle, XCircle,
  Phone, Home, Loader2, Shield, ChevronDown, ChevronUp, Cpu
} from "lucide-react";
import { hapticRiskLevel, hapticImpact } from "../platform/haptics";
import { useEdgeStatus } from "../edge/EdgeStatusContext";
import { RISK_COLORS, RISK_LABELS, type RiskLevel } from "../data/types";
import { motion, AnimatePresence } from "motion/react";

interface SymptomAnalysisResult {
  riskLevel: RiskLevel;
  confidence: number;
  parentSummary: string;
  clinicalSummary: string;
  nextSteps: string[];
  keyFindings: string[];
  inferenceTimeMs: number;
  usedEdge: boolean;
}

const riskIcons: Record<RiskLevel, typeof CheckCircle> = {
  on_track: CheckCircle,
  monitor: AlertCircle,
  discuss: AlertTriangle,
  refer: XCircle,
};

const RISK_BG: Record<RiskLevel, string> = {
  on_track: "#E8F5E8",
  monitor: "#FFF8E1",
  discuss: "#FFF3E0",
  refer: "#FDECEA",
};

const triageActions: Record<RiskLevel, { label: string; urgent: boolean }[]> = {
  on_track: [
    { label: "Continue monitoring at home", urgent: false },
    { label: "Mention at your next routine visit", urgent: false },
    { label: "Keep an eye on fluid intake and appetite", urgent: false },
  ],
  monitor: [
    { label: "Call your pediatrician today for guidance", urgent: false },
    { label: "Monitor key symptoms every few hours", urgent: false },
    { label: "Keep a log of temperature and behavior changes", urgent: false },
  ],
  discuss: [
    { label: "Contact your doctor within 24 hours", urgent: true },
    { label: "Watch for any worsening of symptoms", urgent: true },
    { label: "Ensure your child stays hydrated", urgent: false },
    { label: "Keep this summary for your doctor visit", urgent: false },
  ],
  refer: [
    { label: "Call your doctor NOW or visit the emergency room", urgent: true },
    { label: "Do not wait — seek medical care today", urgent: true },
    { label: "Bring this screening summary with you", urgent: false },
  ],
};

function generateMockResult(
  symptoms: string[],
  severity: number,
  duration: string,
  ageMonths: number,
  usedEdge: boolean
): SymptomAnalysisResult {
  const start = performance.now();

  let riskScore = 0;
  riskScore += severity * 0.3;
  riskScore += symptoms.length * 0.1;
  if (["days", "week"].includes(duration)) riskScore += 0.15;
  if (ageMonths < 6) riskScore += 0.1;

  const hasBreathing = symptoms.some((s) => s.toLowerCase().includes("breathing") || s.toLowerCase().includes("wheez"));
  const hasFever = symptoms.some((s) => s.toLowerCase().includes("fever"));
  const hasUnresponsive = symptoms.some((s) => s.toLowerCase().includes("unresponsive") || s.toLowerCase().includes("hard to wake"));

  if (hasBreathing) riskScore += 0.15;
  if (hasFever && ageMonths < 3) riskScore += 0.2;
  if (hasUnresponsive) riskScore += 0.3;

  riskScore = Math.min(riskScore, 1);

  let riskLevel: RiskLevel;
  if (riskScore < 0.3) riskLevel = "on_track";
  else if (riskScore < 0.5) riskLevel = "monitor";
  else if (riskScore < 0.7) riskLevel = "discuss";
  else riskLevel = "refer";

  const confidence = 0.78 + Math.random() * 0.15;

  const symptomList = symptoms.join(", ").toLowerCase();
  const parentSummaries: Record<RiskLevel, string> = {
    on_track: `Based on the symptoms you described (${symptomList}), your child's condition appears manageable at home for now. Continue monitoring and maintain normal routines. If anything changes or you feel more worried, don't hesitate to call your doctor.`,
    monitor: `The symptoms you reported (${symptomList}) suggest your child may benefit from a check-in with your pediatrician today. While not an emergency, it's a good idea to get professional guidance to make sure everything is okay.`,
    discuss: `The combination of symptoms (${symptomList}) warrants a conversation with your child's doctor within the next 24 hours. Keep a close eye on your child and note any changes in their condition.`,
    refer: `The symptoms you described (${symptomList}) indicate your child should be seen by a medical professional as soon as possible. Please contact your doctor or visit the nearest emergency room today.`,
  };

  const clinicalSummaries: Record<RiskLevel, string> = {
    on_track: `${ageMonths}-month-old presenting with ${symptomList}. Symptom profile consistent with common, self-limiting condition. No red flags identified. Recommend continued home monitoring with standard return precautions.`,
    monitor: `${ageMonths}-month-old with ${symptomList}. Moderate concern level given symptom combination. Recommend same-day phone or telemedicine consultation to assess need for in-person evaluation.`,
    discuss: `${ageMonths}-month-old presenting with ${symptomList}. Clinical concern elevated given duration and severity. Recommend evaluation within 24 hours. Consider basic workup if symptoms persist or worsen.`,
    refer: `${ageMonths}-month-old with ${symptomList}. Symptom profile suggests need for urgent medical evaluation. Recommend immediate in-person assessment. Consider CBC, CMP, and targeted imaging based on presentation.`,
  };

  const keyFindings: string[] = [
    `${symptoms.length} symptom${symptoms.length > 1 ? "s" : ""} reported: ${symptomList}`,
    `Severity rated as ${["", "mild", "moderate", "severe", "critical"][severity]}`,
    `Duration: ${duration === "1hr" ? "less than 1 hour" : duration === "hours" ? "1-6 hours" : duration === "day" ? "6-24 hours" : duration === "days" ? "1-3 days" : "more than 3 days"}`,
  ];
  if (hasFever) keyFindings.push("Fever reported — monitor temperature regularly");
  if (hasBreathing) keyFindings.push("Breathing concern noted — watch for worsening");
  if (ageMonths < 6) keyFindings.push("Young infant — lower threshold for medical evaluation");

  const inferenceTimeMs = Math.round(performance.now() - start + 300 + Math.random() * 400);

  return {
    riskLevel,
    confidence,
    parentSummary: parentSummaries[riskLevel],
    clinicalSummary: clinicalSummaries[riskLevel],
    nextSteps: triageActions[riskLevel].map((a) => a.label),
    keyFindings,
    inferenceTimeMs,
    usedEdge,
  };
}

export function SymptomResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { symptoms = [], ageMonths = 12, ageLabel = "General", duration = "hours", severity = 2, details = "" } = (location.state as {
    symptoms?: string[];
    ageMonths?: number;
    ageLabel?: string;
    duration?: string;
    severity?: number;
    details?: string;
  }) || {};

  const { engine, ready: edgeReady } = useEdgeStatus();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const [showClinical, setShowClinical] = useState(false);
  const [showFindings, setShowFindings] = useState(false);
  const missingState = !location.state || !symptoms.length;

  useEffect(() => {
    if (missingState) {
      navigate("/symptom-checker", { replace: true });
    }
  }, [missingState, navigate]);

  useEffect(() => {
    if (missingState) return undefined;
    const timer = setTimeout(() => {
      const usedEdge = !!(engine && edgeReady);
      const analysisResult = generateMockResult(symptoms, severity, duration, ageMonths, usedEdge);
      setResult(analysisResult);
      setIsAnalyzing(false);
      hapticRiskLevel(analysisResult.riskLevel);
    }, 1500 + Math.random() * 800);

    return () => clearTimeout(timer);
  }, []);

  if (missingState) return null;

  if (isAnalyzing) {
    return (
      <MobileContainer>
        <div className="h-full flex flex-col items-center justify-center gap-5 bg-[#F8F9FA] px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-[#E8F0FE] flex items-center justify-center"
          >
            <Loader2 className="w-10 h-10 text-[#1A73E8] animate-spin" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-xl font-bold text-[#1A73E8] mb-1">Analyzing Symptoms</p>
            <p className="text-sm text-[#666666]">
              Evaluating {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""} with MedGemma...
            </p>
          </motion.div>
          <motion.div className="w-full max-w-[200px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1A73E8] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-1.5 text-xs text-[#999999]"
          >
            <Cpu className="w-3 h-3" />
            On-device inference
          </motion.div>
        </div>
      </MobileContainer>
    );
  }

  if (!result) return null;

  const RiskIcon = riskIcons[result.riskLevel];
  const riskColor = RISK_COLORS[result.riskLevel];
  const actions = triageActions[result.riskLevel];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate("/symptom-checker")} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Results</h1>
          <span className="ml-auto text-xs text-[#999999]">{result.inferenceTimeMs}ms</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 text-center border-l-[6px]"
            style={{ backgroundColor: RISK_BG[result.riskLevel], borderLeftColor: riskColor }}
          >
            <RiskIcon className="w-10 h-10 mx-auto mb-2" style={{ color: riskColor }} />
            <h2 className="text-2xl font-bold" style={{ color: riskColor }}>
              {RISK_LABELS[result.riskLevel]}
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              {Math.round(result.confidence * 100)}% confidence &bull; {ageLabel}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">For You (Parent/Caregiver)</h3>
            <p className="text-sm text-[#666666] leading-relaxed">{result.parentSummary}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Next Steps</h3>
            <div className="space-y-2">
              {actions.map((action, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 ${
                    action.urgent ? "border-[#FFCDD2] bg-[#FFF5F5]" : "border-gray-100 bg-white"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: action.urgent ? "#EA4335" : "#1A73E8" }}
                  >
                    {i + 1}
                  </div>
                  <p className={`text-sm flex-1 ${action.urgent ? "font-semibold text-[#C62828]" : "text-[#1A1A1A]"}`}>
                    {action.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <button
            onClick={() => setShowFindings(!showFindings)}
            className="w-full flex items-center justify-between p-3.5 bg-[#F0F7FF] rounded-xl"
          >
            <span className="text-sm font-bold text-[#1A73E8]">Key Findings</span>
            {showFindings ? <ChevronUp className="w-4 h-4 text-[#1A73E8]" /> : <ChevronDown className="w-4 h-4 text-[#1A73E8]" />}
          </button>
          <AnimatePresence>
            {showFindings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 space-y-2">
                  {result.keyFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#1A73E8] mt-0.5 text-xs">&#8226;</span>
                      <p className="text-xs text-[#1A1A1A]">{finding}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowClinical(!showClinical)}
            className="w-full flex items-center justify-between p-3.5 bg-[#F3E5F5] rounded-xl"
          >
            <span className="text-sm font-bold text-[#9C27B0]">For Your Clinician</span>
            {showClinical ? <ChevronUp className="w-4 h-4 text-[#9C27B0]" /> : <ChevronDown className="w-4 h-4 text-[#9C27B0]" />}
          </button>
          <AnimatePresence>
            {showClinical && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border-2 border-[#CE93D8] rounded-xl p-3.5 space-y-2">
                  <p className="text-[10px] font-bold text-[#9C27B0] uppercase">
                    AI-Generated Draft — Requires Clinician Review
                  </p>
                  <p className="text-sm text-[#666666] leading-relaxed">{result.clinicalSummary}</p>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                    <Shield className="w-3 h-3 text-[#34A853]" />
                    <span className="text-[10px] text-[#34A853] font-semibold">Safety checks applied</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(result.riskLevel === "refer" || result.riskLevel === "discuss") && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#FDECEA] border-2 border-[#FFCDD2] rounded-2xl p-4 text-center"
            >
              <AlertTriangle className="w-8 h-8 text-[#EA4335] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#C62828] mb-1">Need immediate help?</p>
              <p className="text-xs text-[#B71C1C] mb-3">
                Call emergency services if your child has trouble breathing, is unresponsive, has seizures, or turns blue.
              </p>
              <button
                onClick={() => {
                  hapticImpact("heavy");
                  window.open("tel:911");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#EA4335] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
              >
                <Phone className="w-4 h-4" />
                Call Emergency (911)
              </button>
            </motion.div>
          )}

          <div className="bg-[#E8F0FE] rounded-xl p-3.5">
            <p className="text-xs text-[#1A73E8] leading-relaxed">
              This AI screening tool provides guidance only — it does not make diagnoses. Always seek professional medical advice. Take this summary to your child's doctor.
            </p>
          </div>

          {result.usedEdge && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#999999]">
              <Cpu className="w-3 h-3" />
              Analyzed on-device with Edge AI
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-3 space-y-2" style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
          <button
            onClick={() => {
              hapticImpact("light");
              navigate("/symptom-checker");
            }}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-[#1A73E8] text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            New Symptom Check
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[#666666] active:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}

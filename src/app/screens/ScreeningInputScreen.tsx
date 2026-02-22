import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { AIPipelineAnimation } from "../components/AIPipelineAnimation";
import {
  ArrowLeft, Mic, MicOff, FileText, Send, User, MapPin,
  Calendar, Activity, ChevronRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";
import type { PediatricScreeningInput, EnhancedScreeningResult } from "../rop/ropTypes";
import { mockTranscribeSpeech } from "../rop/ropMockService";
import { useMedGemma } from "../hooks/useMedGemma";

type ScreeningStep = "input" | "processing" | "done";

const DOMAINS = [
  { value: "comprehensive", label: "Comprehensive", icon: "🔬" },
  { value: "communication", label: "Communication", icon: "💬" },
  { value: "gross_motor", label: "Gross Motor", icon: "🏃" },
  { value: "fine_motor", label: "Fine Motor", icon: "✋" },
  { value: "problem_solving", label: "Problem Solving", icon: "🧩" },
  { value: "personal_social", label: "Personal-Social", icon: "👫" },
];

const SETTINGS = [
  { value: "home", label: "Home Visit" },
  { value: "clinic", label: "Clinic" },
  { value: "field", label: "Field/Community" },
];

export function ScreeningInputScreen() {
  const navigate = useNavigate();
  const { analyzeScreening, state: medGemmaState } = useMedGemma();
  const [step, setStep] = useState<ScreeningStep>("input");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<EnhancedScreeningResult | null>(null);

  const [formData, setFormData] = useState<PediatricScreeningInput>({
    childAgeMonths: 24,
    gender: "M",
    parentName: "",
    setting: "clinic",
    domain: "comprehensive",
    parentReport: "",
    chwObservations: "",
  });

  const handleTranscribe = useCallback(async () => {
    setIsTranscribing(true);
    hapticImpact("medium");
    await new Promise((res) => setTimeout(res, 1500));
    const transcript = mockTranscribeSpeech();
    setFormData((prev) => ({
      ...prev,
      parentReport: prev.parentReport
        ? prev.parentReport + "\n\n" + transcript
        : transcript,
    }));
    setIsTranscribing(false);
    hapticNotification("success");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.parentReport.trim()) return;

    setStep("processing");
    hapticImpact("heavy");

    const progressInterval = setInterval(() => {
      setPipelineProgress((prev) => {
        if (prev >= 0.95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 0.04;
      });
    }, 120);

    try {
      const res = await analyzeScreening(formData);
      clearInterval(progressInterval);
      setPipelineProgress(1);
      setResult(res);

      setTimeout(() => {
        setStep("done");
        hapticNotification("success");
      }, 600);
    } catch {
      clearInterval(progressInterval);
      setStep("input");
    }
  }, [formData]);

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white pb-8">
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Clinical Screening</h1>
            <p className="text-sm text-[#666666]">MedGemma-2B-IT · ASQ-3 Validated</p>
          </div>
        </div>

        <div className="px-4">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1A73E8]" />
                    Patient Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#666] block mb-1">Age (months)</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#999]" />
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={formData.childAgeMonths}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, childAgeMonths: parseInt(e.target.value) || 0 }))
                          }
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#666] block mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as "M" | "F" | "Other" }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#666] block mb-1">Parent/Guardian Name</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData((p) => ({ ...p, parentName: e.target.value }))}
                      placeholder="Enter parent name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#666] block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Setting
                    </label>
                    <div className="flex gap-2">
                      {SETTINGS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setFormData((p) => ({ ...p, setting: s.value as any }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                            formData.setting === s.value
                              ? "bg-[#1A73E8] text-white"
                              : "bg-gray-50 border border-gray-200 text-[#666]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[#34A853]" />
                    Screening Domain
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setFormData((p) => ({ ...p, domain: d.value as any }))}
                        className={`p-3 rounded-xl text-center transition-colors ${
                          formData.domain === d.value
                            ? "bg-[#E8F5E9] border-2 border-[#34A853]"
                            : "bg-gray-50 border-2 border-gray-100"
                        }`}
                      >
                        <span className="text-lg block mb-1">{d.icon}</span>
                        <span className={`text-xs font-medium ${
                          formData.domain === d.value ? "text-[#2E7D32]" : "text-[#666]"
                        }`}>
                          {d.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#9C27B0]" />
                      Parent Observations
                    </h3>
                    <button
                      onClick={handleTranscribe}
                      disabled={isTranscribing}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        isTranscribing
                          ? "bg-red-100 text-red-700"
                          : "bg-[#E8EAF6] text-[#3F51B5]"
                      }`}
                    >
                      {isTranscribing ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 animate-pulse" />
                          Transcribing...
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          Speech-to-Text
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={formData.parentReport}
                    onChange={(e) => setFormData((p) => ({ ...p, parentReport: e.target.value }))}
                    placeholder="Describe the child's developmental observations, milestones, concerns..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-[#999] mt-1">
                    Tap Speech-to-Text to simulate Whisper.cpp transcription
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#FF9800]" />
                    CHW Observations (Optional)
                  </h3>
                  <textarea
                    value={formData.chwObservations}
                    onChange={(e) => setFormData((p) => ({ ...p, chwObservations: e.target.value }))}
                    placeholder="Community Health Worker observations from home visit..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[80px] resize-none"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!formData.parentReport.trim()}
                  className={`w-full rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg ${
                    formData.parentReport.trim()
                      ? "bg-gradient-to-r from-[#1A73E8] to-[#4285F4] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Run MedGemma Analysis
                </motion.button>

                <div className="bg-[#FFF8E1] border border-[#FFF59D] rounded-2xl p-3">
                  <p className="text-xs text-[#666]">
                    <strong>4-Layer Pipeline:</strong> Whisper STT (0.8s) → MedSigLIP Vision (1.2s) →
                    MedGemma-2B-IT Inference (2.1s) → Risk Stratification (0.6s). All processing on-device.
                  </p>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <AIPipelineAnimation
                  progress={pipelineProgress}
                  modelSize={450}
                  memoryUsage={320}
                />
                <p className="text-center text-xs text-[#999] mt-4">
                  Processing {formData.childAgeMonths}-month-old · {formData.domain} domain
                </p>
              </motion.div>
            )}

            {step === "done" && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <AIPipelineAnimation
                  progress={1}
                  modelSize={450}
                  memoryUsage={320}
                  completed
                  latencyMs={result.latencyMs}
                />

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate("/screening-results-enhanced", {
                      state: { result, input: formData },
                    })
                  }
                  className="w-full bg-gradient-to-r from-[#1A73E8] to-[#4285F4] rounded-2xl p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">View Clinical Results</p>
                      <p className="text-white/70 text-sm">
                        ASQ-3: {result.asq3_equivalent.percentile}th percentile · {result.risk_level.replace("_", " ")}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60" />
                  </div>
                </motion.button>

                <button
                  onClick={() => {
                    setStep("input");
                    setPipelineProgress(0);
                    setResult(null);
                  }}
                  className="w-full text-center text-sm text-[#1A73E8] font-medium py-2"
                >
                  New Screening
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}

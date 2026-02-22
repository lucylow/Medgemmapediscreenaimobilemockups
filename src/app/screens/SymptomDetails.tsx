import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Clock, Activity, MessageSquare, AlertTriangle, Phone } from "lucide-react";
import { hapticImpact, hapticSelection } from "../platform/haptics";
import { motion } from "motion/react";

const durationOptions = [
  { label: "< 1 hour", value: "1hr" },
  { label: "1–6 hours", value: "hours" },
  { label: "6–24 hours", value: "day" },
  { label: "1–3 days", value: "days" },
  { label: "3+ days", value: "week" },
];

const severityLevels = [
  { value: 1, label: "Mild", desc: "Barely noticeable", color: "#34A853" },
  { value: 2, label: "Moderate", desc: "Clearly present", color: "#FBBC05" },
  { value: 3, label: "Severe", desc: "Very concerning", color: "#FF9800" },
  { value: 4, label: "Critical", desc: "Needs urgent attention", color: "#EA4335" },
];

export function SymptomDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { symptoms = [], ageMonths = 12, ageLabel = "General" } = (location.state as {
    symptoms?: string[];
    ageMonths?: number;
    ageLabel?: string;
  }) || {};

  const [duration, setDuration] = useState("hours");
  const [severity, setSeverity] = useState(2);
  const [details, setDetails] = useState("");
  const missingState = !location.state || !symptoms.length;

  useEffect(() => {
    if (missingState) {
      navigate("/symptom-checker", { replace: true });
    }
  }, [missingState, navigate]);

  if (missingState) return null;

  const handleAnalyze = () => {
    hapticImpact("heavy");
    navigate("/symptom-results", {
      state: { symptoms, ageMonths, ageLabel, duration, severity, details },
    });
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Tell Us More</h1>
            <p className="text-xs text-[#666666]">{symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""} selected</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-36">
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s: string) => (
              <span key={s} className="bg-[#E8F0FE] text-[#1A73E8] text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                {s}
              </span>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#1A73E8]" />
              <p className="text-sm font-bold text-[#1A1A1A]">How long has this been happening?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    hapticSelection();
                    setDuration(opt.value);
                  }}
                  className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                    duration === opt.value
                      ? "bg-[#1A73E8] text-white shadow-md"
                      : "bg-[#F8F9FA] text-[#666666] border border-gray-200 active:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#1A73E8]" />
              <p className="text-sm font-bold text-[#1A1A1A]">How severe does it seem?</p>
            </div>
            <div className="space-y-2">
              {severityLevels.map((level) => {
                const isSelected = severity === level.value;
                return (
                  <button
                    key={level.value}
                    onClick={() => {
                      hapticSelection();
                      setSeverity(level.value);
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                      isSelected
                        ? "shadow-md border-2"
                        : "bg-[#F8F9FA] border-2 border-transparent"
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: level.color + "12", borderColor: level.color }
                        : {}
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.value}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isSelected ? "" : "text-[#1A1A1A]"}`} style={isSelected ? { color: level.color } : {}}>
                        {level.label}
                      </p>
                      <p className="text-xs text-[#999999]">{level.desc}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: level.color }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#1A73E8]" />
              <p className="text-sm font-bold text-[#1A1A1A]">Any other details? (optional)</p>
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="E.g., fever started suddenly, child seems very irritable, drank less today..."
              rows={4}
              className="w-full p-3.5 bg-[#F8F9FA] border-2 border-gray-200 rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#BBBBBB] focus:outline-none focus:border-[#1A73E8] transition-colors resize-none"
            />
          </div>

          <div className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E65100] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#BF360C] leading-relaxed">
                Still concerned? Use the emergency button or call your doctor now.
              </p>
              <button
                onClick={() => window.open("tel:911")}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#EA4335]"
              >
                <Phone className="w-3 h-3" />
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3" style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
          <button
            onClick={handleAnalyze}
            className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-[#1A73E8] to-[#0D47A1] text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Activity className="w-5 h-5" />
            Analyze Symptoms
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}

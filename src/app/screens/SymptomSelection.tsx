import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { ArrowLeft, Check } from "lucide-react";
import { hapticSelection, hapticImpact } from "../platform/haptics";
import { motion, AnimatePresence } from "motion/react";

interface SymptomCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  symptoms: string[];
}

const symptomCategories: SymptomCategory[] = [
  {
    id: "fever",
    title: "Fever & Temperature",
    icon: "🌡️",
    color: "#EA4335",
    symptoms: ["Fever 100.4\u00B0F+ (38\u00B0C+)", "Chills or shivering", "Hot or cold feeling", "Night sweats"],
  },
  {
    id: "respiratory",
    title: "Breathing Issues",
    icon: "🫁",
    color: "#1A73E8",
    symptoms: ["Fast breathing", "Wheezing or whistling sound", "Persistent cough", "Nose flaring while breathing"],
  },
  {
    id: "feeding",
    title: "Feeding Problems",
    icon: "🍼",
    color: "#FF9800",
    symptoms: ["Refusing to eat or drink", "Vomiting after feeds", "Diarrhea", "Fewer wet diapers than usual"],
  },
  {
    id: "behavior",
    title: "Behavior Changes",
    icon: "😴",
    color: "#9C27B0",
    symptoms: ["Unusually sleepy or hard to wake", "More irritable than usual", "Crying that won't stop", "Less active or playful"],
  },
  {
    id: "skin",
    title: "Skin & Rash",
    icon: "🩹",
    color: "#34A853",
    symptoms: ["New rash or spots", "Skin looks pale or bluish", "Swelling on face or body", "Red or warm skin area"],
  },
  {
    id: "pain",
    title: "Pain & Discomfort",
    icon: "😣",
    color: "#F44336",
    symptoms: ["Ear pulling or tugging", "Tummy pain or bloating", "Headache complaints", "Stiff neck or body"],
  },
];

const MAX_SYMPTOMS = 5;

export function SymptomSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ageMonths = 12, ageLabel = "General" } = (location.state as { ageMonths?: number; ageLabel?: string }) || {};
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("fever");
  const missingState = !location.state;

  useEffect(() => {
    if (missingState) {
      navigate("/symptom-checker", { replace: true });
    }
  }, [missingState, navigate]);

  if (missingState) return null;

  const toggleSymptom = (symptom: string) => {
    hapticSelection();
    setSelected((prev) => {
      if (prev.includes(symptom)) return prev.filter((s) => s !== symptom);
      if (prev.length >= MAX_SYMPTOMS) return prev;
      return [...prev, symptom];
    });
  };

  const toggleCategory = (categoryId: string) => {
    hapticSelection();
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    hapticImpact("medium");
    navigate("/symptom-details", { state: { symptoms: selected, ageMonths, ageLabel } });
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1A1A1A]">Select Symptoms</h1>
            <p className="text-xs text-[#666666]">{ageLabel} &bull; Pick up to {MAX_SYMPTOMS}</p>
          </div>
          {selected.length > 0 && (
            <span className="bg-[#1A73E8] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {selected.length}/{MAX_SYMPTOMS}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-[#E8F0FE] rounded-xl p-3"
            >
              <p className="text-xs font-semibold text-[#1A73E8] mb-2">Selected symptoms:</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="flex items-center gap-1 bg-white text-[#1A73E8] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#1A73E8]/20 active:bg-[#1A73E8]/10"
                  >
                    {s}
                    <span className="text-[#999999] ml-0.5">&times;</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {symptomCategories.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const categorySelectedCount = category.symptoms.filter((s) => selected.includes(s)).length;

            return (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-3 p-4 active:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: category.color + "15" }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-[#1A1A1A]">{category.title}</p>
                    <p className="text-xs text-[#999999]">{category.symptoms.length} symptoms</p>
                  </div>
                  {categorySelectedCount > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      {categorySelectedCount}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[#CCCCCC]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1.5">
                        {category.symptoms.map((symptom) => {
                          const isSelected = selected.includes(symptom);
                          const isDisabled = !isSelected && selected.length >= MAX_SYMPTOMS;

                          return (
                            <button
                              key={symptom}
                              onClick={() => !isDisabled && toggleSymptom(symptom)}
                              disabled={isDisabled}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                isSelected
                                  ? "bg-[#E8F0FE] border-2 border-[#1A73E8]"
                                  : isDisabled
                                  ? "bg-gray-50 opacity-50"
                                  : "bg-[#F8F9FA] border-2 border-transparent hover:border-gray-200"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected
                                    ? "bg-[#1A73E8] border-[#1A73E8]"
                                    : "border-[#CCCCCC]"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${isSelected ? "font-semibold text-[#1A73E8]" : "text-[#1A1A1A]"}`}>
                                {symptom}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3" style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selected.length === 0
                ? "bg-gray-200 text-gray-400"
                : "bg-[#1A73E8] text-white shadow-lg active:scale-[0.98]"
            }`}
          >
            {selected.length === 0
              ? "Select at least 1 symptom"
              : `Next: Describe Symptoms (${selected.length}/${MAX_SYMPTOMS})`}
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}

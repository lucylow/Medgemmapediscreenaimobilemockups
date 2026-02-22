import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { TabBar } from "../components/TabBar";
import { hapticImpact, hapticSelection } from "../platform/haptics";
import { motion } from "motion/react";
import { Stethoscope, AlertTriangle, Baby, ChevronRight, Phone, ShieldAlert } from "lucide-react";

const ageGroups = [
  { icon: "👶", label: "Newborn", sub: "0–3 months", ageMonths: 2 },
  { icon: "🍼", label: "Infant", sub: "3–12 months", ageMonths: 6 },
  { icon: "🧒", label: "Toddler", sub: "1–3 years", ageMonths: 24 },
  { icon: "👦", label: "Preschool", sub: "3–5 years", ageMonths: 48 },
];

const emergencySymptoms = [
  "Trouble breathing or blue lips",
  "Unresponsive or hard to wake",
  "Seizures or convulsions",
  "Severe bleeding that won't stop",
];

export function SymptomCheckerWelcome() {
  const navigate = useNavigate();

  const handleAgeSelect = (ageMonths: number, label: string) => {
    hapticImpact("medium");
    navigate("/symptom-selection", { state: { ageMonths, ageLabel: label } });
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#0D47A1] px-6 pt-8 pb-10 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Stethoscope className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold mb-2"
            >
              Child Symptom Checker
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto"
            >
              Get guidance on common symptoms. Always call emergency services for serious concerns.
            </motion.p>
          </div>

          <div className="px-5 -mt-6 space-y-5">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-3">
                Select age group
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ageGroups.map((group, i) => (
                  <motion.button
                    key={group.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleAgeSelect(group.ageMonths, group.label + " (" + group.sub + ")")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F0F7FF] border-2 border-transparent hover:border-[#1A73E8] active:scale-[0.97] transition-all min-h-[100px] justify-center"
                  >
                    <span className="text-3xl">{group.icon}</span>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A1A1A]">{group.label}</p>
                      <p className="text-xs text-[#666666]">{group.sub}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => {
                hapticSelection();
                navigate("/symptom-selection", { state: { ageMonths: 12, ageLabel: "General" } });
              }}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-[#E8F5E8] rounded-xl flex items-center justify-center">
                <Baby className="w-5 h-5 text-[#34A853]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-[#1A1A1A]">Quick Check</p>
                <p className="text-xs text-[#666666]">Skip age — go straight to symptoms</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#CCCCCC]" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#FFF3E0] border border-[#FFE0B2] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-[#E65100]" />
                <p className="text-sm font-bold text-[#E65100]">Not for emergencies</p>
              </div>
              <p className="text-xs text-[#BF360C] leading-relaxed mb-3">
                Call your local emergency number immediately for:
              </p>
              <div className="space-y-1.5">
                {emergencySymptoms.map((symptom) => (
                  <div key={symptom} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-[#E65100] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#BF360C]">{symptom}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  hapticImpact("heavy");
                  window.open("tel:911");
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-[#EA4335] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
              >
                <Phone className="w-4 h-4" />
                Call Emergency Services
              </button>
            </motion.div>
          </div>

          <div className="px-5 pt-4">
            <DisclaimerFooter />
          </div>
        </div>

        <TabBar />
      </div>
    </MobileContainer>
  );
}

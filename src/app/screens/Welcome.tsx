import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Baby, Award, User, HeartPulse, Stethoscope, Settings, Trash2, Sparkles } from "lucide-react";
import { UserRole } from "../data/types";
import { loadDemoData } from "../data/demoData";
import { useState } from "react";
import { motion } from "motion/react";

export function Welcome() {
  const navigate = useNavigate();
  const { setRole, role, clearData, refreshData, children, results } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === "clinician") {
      navigate("/clinician-review");
    } else {
      navigate("/children");
    }
  };

  const hasData = children.length > 0 || results.length > 0;

  return (
    <MobileContainer>
      <div className="h-full flex flex-col px-6 pt-12 pb-4 relative">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 flex items-center justify-center text-[#6B7280]"
          >
            <Settings className="w-5 h-5" />
          </button>
          {showSettings && (
            <div className="absolute top-10 right-0 rounded-2xl p-4 shadow-xl w-[200px]" style={{ backgroundColor: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.3)" }}>
              <button
                onClick={() => {
                  if (confirm("Delete all stored data? This cannot be undone.")) {
                    clearData();
                    setShowSettings(false);
                  }
                }}
                className="flex items-center gap-2 text-[#EF4444] text-sm font-semibold w-full"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-[#E5E7EB]">PediScreen AI</h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(148,163,184,0.14)", border: "1px solid rgba(148,163,184,0.3)" }}>
            <span className="text-sm text-[#9CA3AF]">MedGemma Impact Challenge</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Award className="w-5 h-5 text-[#FACC15]" />
            <span className="text-sm font-semibold text-[#FACC15]">Kaggle Gold Certified</span>
          </div>
        </div>

        <motion.div
          className="flex-1 flex flex-col items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)", transform: "scale(1.8)" }} />
            <div className="w-36 h-36 rounded-full flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}>
              <Baby className="w-20 h-20 text-[#0B1120]" />
            </div>
          </div>
          <motion.div
            className="rounded-2xl p-5 max-w-[320px] text-center"
            style={{ backgroundColor: "rgba(148,163,184,0.14)", border: "1px solid rgba(148,163,184,0.2)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Developmental screening support for children 0-5 years.
              Guided questions, AI-assisted analysis, and clear next steps.
            </p>
          </motion.div>
        </motion.div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#6B7280] text-center">I am a...</p>
          <PrimaryButton onClick={() => handleRoleSelect("parent")}>
            <User className="w-5 h-5 mr-2 inline" />
            Parent / Caregiver
          </PrimaryButton>
          <PrimaryButton variant="success" onClick={() => handleRoleSelect("chw")}>
            <HeartPulse className="w-5 h-5 mr-2 inline" />
            Community Health Worker
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={() => handleRoleSelect("clinician")}>
            <Stethoscope className="w-5 h-5 mr-2 inline" />
            Clinician (Demo Mode)
          </PrimaryButton>

          {hasData && (
            <button
              onClick={() => {
                if (role === "clinician") navigate("/clinician-review");
                else navigate("/children");
              }}
              className="w-full text-center text-sm text-[#38BDF8] font-semibold pt-2"
            >
              Continue where I left off →
            </button>
          )}

          <button
            onClick={() => {
              loadDemoData();
              refreshData();
              navigate("/dashboard");
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-[#A855F7] font-semibold pt-2"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Data (4 sample children)
          </button>
        </div>

        <div className="mt-4">
          <DisclaimerFooter />
        </div>
      </div>
    </MobileContainer>
  );
}

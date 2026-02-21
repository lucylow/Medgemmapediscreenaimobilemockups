import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Baby, Award, User, HeartPulse, Stethoscope, Settings, Trash2, Sparkles } from "lucide-react";
import { UserRole } from "../data/types";
import { loadDemoData } from "../data/demoData";
import { useState } from "react";

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
            className="w-10 h-10 flex items-center justify-center text-[#999999]"
          >
            <Settings className="w-5 h-5" />
          </button>
          {showSettings && (
            <div className="absolute top-10 right-0 bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-xl w-[200px]">
              <button
                onClick={() => {
                  if (confirm("Delete all stored data? This cannot be undone.")) {
                    clearData();
                    setShowSettings(false);
                  }
                }}
                className="flex items-center gap-2 text-[#EA4335] text-sm font-semibold w-full"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">PediScreen AI</h1>
          <p className="text-lg text-[#666666]">MedGemma Impact Challenge</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Award className="w-6 h-6 text-[#FF9800]" />
            <span className="text-sm font-semibold text-[#FF9800]">Kaggle Gold Certified</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-36 h-36 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center mb-6">
            <Baby className="w-20 h-20 text-white" />
          </div>
          <p className="text-sm text-[#999999] text-center max-w-[300px]">
            Developmental screening support for children 0-5 years.
            Guided questions, AI-assisted analysis, and clear next steps.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#666666] text-center">I am a...</p>
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
              className="w-full text-center text-sm text-[#1A73E8] font-semibold pt-2"
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
            className="w-full flex items-center justify-center gap-2 text-sm text-[#9C27B0] font-semibold pt-2"
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

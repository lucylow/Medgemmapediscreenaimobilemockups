import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Baby, Award, User, HeartPulse, Stethoscope, Sparkles } from "lucide-react";
import { UserRole } from "../data/types";
import { loadDemoData } from "../data/demoData";
import { motion } from "motion/react";

export function Welcome() {
  const navigate = useNavigate();
  const { setRole, role, refreshData, children, results } = useApp();

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
      <div className="h-full flex flex-col px-6 pt-16 pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">PediScreen AI</h1>
          <p className="text-lg text-[#666666]">MedGemma Impact Challenge</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Award className="w-6 h-6 text-[#FF9800]" />
            <span className="text-sm font-semibold text-[#FF9800]">Kaggle Gold Certified</span>
          </div>
        </div>

        <motion.div
          className="flex-1 flex flex-col items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="w-48 h-48 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center mb-8">
            <Baby className="w-24 h-24 text-white" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-4xl font-bold text-[#1A73E8]">$100K</p>
            <p className="text-lg text-[#666666]">Per child lifetime savings</p>
            <p className="text-sm text-[#999999] mt-2">
              Early detection &bull; Community health workers &bull; Real-time risk assessment
            </p>
          </div>
        </motion.div>

        <div className="space-y-3">
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
              Continue where I left off &rarr;
            </button>
          )}

          <button
            onClick={() => {
              loadDemoData();
              refreshData();
              navigate("/dashboard");
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-[#FF9800] font-semibold pt-1"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Data (4 sample children)
          </button>
        </div>

        <div className="flex justify-center gap-2 pt-4">
          <div className="w-3 h-3 rounded-full bg-[#1A73E8]"></div>
          <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
          <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
          <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
        </div>

        <div className="mt-4">
          <DisclaimerFooter />
        </div>
      </div>
    </MobileContainer>
  );
}

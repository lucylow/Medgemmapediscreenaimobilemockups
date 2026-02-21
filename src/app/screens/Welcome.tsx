import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { Baby, Award } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="h-full flex flex-col px-6 pt-16 pb-8">
        {/* Header - Top 20% */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">PediScreen AI</h1>
          <p className="text-lg text-[#666666]">MedGemma Impact Challenge</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Award className="w-6 h-6 text-[#FF9800]" />
            <span className="text-sm font-semibold text-[#FF9800]">Kaggle Gold Certified</span>
          </div>
        </div>

        {/* Hero Visual - Center 40% */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-48 h-48 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center mb-8">
            <Baby className="w-24 h-24 text-white" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-4xl font-bold text-[#1A73E8]">$100K</p>
            <p className="text-lg text-[#666666]">Per child lifetime savings</p>
            <p className="text-sm text-[#999999] mt-2">
              Early detection • Community health workers • Real-time risk assessment
            </p>
          </div>
        </div>

        {/* Action Zone - Bottom 35% */}
        <div className="space-y-4">
          <PrimaryButton onClick={() => navigate("/permissions")}>
            Get Started
          </PrimaryButton>
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-[#1A73E8]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

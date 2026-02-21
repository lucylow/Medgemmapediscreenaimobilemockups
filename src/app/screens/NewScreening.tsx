import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft } from "lucide-react";

const domains = [
  { id: "communication", label: "💬 Communication", color: "#1A73E8" },
  { id: "gross-motor", label: "🏃‍♂️ Gross Motor", color: "#34A853" },
  { id: "fine-motor", label: "✋ Fine Motor", color: "#FF9800" },
  { id: "problem-solving", label: "🧩 Problem Solving", color: "#9C27B0" },
  { id: "personal-social", label: "👫 Personal-Social", color: "#EA4335" },
];

export function NewScreening() {
  const navigate = useNavigate();
  const [age, setAge] = useState(24);
  const [selectedDomain, setSelectedDomain] = useState("");

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">New Screening</h1>
        </div>

        <div className="flex-1 px-6 py-6 space-y-8">
          {/* Age Wheel */}
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Step 1: Child Age</h2>
            <div className="bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-3xl p-8 text-center">
              <div className="text-white mb-4">
                <div className="text-6xl font-bold">{age}</div>
                <div className="text-xl mt-2">months old</div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, white ${(age / 60) * 100}%, rgba(255,255,255,0.3) ${(age / 60) * 100}%)`
                }}
              />
              <div className="flex justify-between text-white text-sm mt-2">
                <span>0mo</span>
                <span>60mo</span>
              </div>
            </div>
          </div>

          {/* Domain Select */}
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Step 2: Select Domain</h2>
            <div className="space-y-3">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`w-full h-[72px] rounded-2xl flex items-center justify-center text-white font-semibold text-lg transition-all ${
                    selectedDomain === domain.id ? 'scale-[0.98] ring-4 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: domain.color,
                    ringColor: selectedDomain === domain.id ? domain.color : 'transparent',
                  }}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Zone */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-6">
          <PrimaryButton
            onClick={() => navigate("/camera-screening")}
            disabled={!selectedDomain}
          >
            Start Camera Screening
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}

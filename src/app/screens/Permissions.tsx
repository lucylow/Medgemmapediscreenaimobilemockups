import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { Camera, Mic, MapPin, Bell, Check } from "lucide-react";

export function Permissions() {
  const navigate = useNavigate();
  const [granted, setGranted] = useState(false);

  const permissions = [
    {
      icon: Camera,
      title: "Camera",
      description: "ROP + behavioral screening",
    },
    {
      icon: Mic,
      title: "Microphone",
      description: "Speech/language analysis",
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Home visit verification",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Urgent referral alerts",
    },
  ];

  const handleGrantAll = () => {
    setGranted(true);
    setTimeout(() => navigate("/auth"), 1000);
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col px-6 pt-16 pb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Permissions Required</h1>
          <p className="text-[#666666] mb-8">
            Enable these features for optimal screening
          </p>

          <div className="space-y-4">
            {permissions.map((perm, index) => (
              <div
                key={index}
                className="bg-[#F8F9FA] rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-[#1A73E8] rounded-full flex items-center justify-center flex-shrink-0">
                  <perm.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1A1A1A]">{perm.title}</h3>
                    {granted && (
                      <Check className="w-5 h-5 text-[#34A853]" />
                    )}
                  </div>
                  <p className="text-sm text-[#666666] mt-1">{perm.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Zone - Bottom 35% */}
        <div className="space-y-4">
          <PrimaryButton onClick={handleGrantAll}>
            {granted ? "Permissions Granted ✓" : "Grant All Permissions"}
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={() => navigate("/auth")}>
            Custom Permissions
          </PrimaryButton>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
            <div className="w-3 h-3 rounded-full bg-[#1A73E8]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

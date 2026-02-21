import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Camera } from "lucide-react";

export function CameraScreening() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"ROP" | "behavioral" | "xray" | null>(null);

  const handleModeSelect = (selectedMode: "ROP" | "behavioral" | "xray") => {
    setMode(selectedMode);
    if (selectedMode === "ROP") {
      navigate("/rop-camera");
    } else if (selectedMode === "behavioral") {
      navigate("/behavioral-analysis");
    }
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/new-screening")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Select Camera Mode</h1>
        </div>

        <div className="flex-1 px-6 py-8 space-y-4">
          {/* ROP Camera */}
          <button
            onClick={() => handleModeSelect("ROP")}
            className="w-full h-[120px] bg-gradient-to-br from-[#EA4335] to-[#FF9800] rounded-3xl p-6 text-left text-white active:scale-[0.98] transition-transform shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">ROP Detection</h3>
                <p className="text-sm mt-1 text-white/90">Retinopathy of Prematurity</p>
              </div>
            </div>
          </button>

          {/* Behavioral Analysis */}
          <button
            onClick={() => handleModeSelect("behavioral")}
            className="w-full h-[120px] bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-3xl p-6 text-left text-white active:scale-[0.98] transition-transform shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Behavioral Analysis</h3>
                <p className="text-sm mt-1 text-white/90">ASQ-3 Milestone Assessment</p>
              </div>
            </div>
          </button>

          {/* X-Ray Analysis */}
          <button
            onClick={() => handleModeSelect("xray")}
            className="w-full h-[120px] bg-gradient-to-br from-[#9C27B0] to-[#673AB7] rounded-3xl p-6 text-left text-white active:scale-[0.98] transition-transform shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Bone Age X-Ray</h3>
                <p className="text-sm mt-1 text-white/90">Growth & Development</p>
              </div>
            </div>
          </button>

          {/* Info Box */}
          <div className="bg-[#F8F9FA] rounded-2xl p-6 mt-8">
            <h4 className="font-bold text-[#1A1A1A] mb-2">Camera Tips</h4>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li>• Ensure good lighting conditions</li>
              <li>• Keep device steady during capture</li>
              <li>• Follow on-screen positioning guides</li>
              <li>• Allow 3-5 seconds for analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

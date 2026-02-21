import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { ArrowLeft, Scan } from "lucide-react";
import { motion } from "motion/react";

export function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setDetected(true);
      setTimeout(() => navigate("/patient/CHW-001"), 1000);
    }, 2000);
  };

  return (
    <MobileContainer className="bg-black">
      <div className="h-full relative">
        {/* Camera View Simulation */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
          {/* QR Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Scanning Box */}
              <motion.div
                className="absolute inset-0 border-4 border-white rounded-3xl"
                animate={scanning ? { borderColor: ["#FFFFFF", "#34A853", "#FFFFFF"] } : {}}
                transition={{ duration: 1, repeat: scanning ? Infinity : 0 }}
              >
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-[#1A73E8] rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[#1A73E8] rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[#1A73E8] rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-[#1A73E8] rounded-br-2xl"></div>
              </motion.div>

              {/* Scanning Line */}
              {scanning && !detected && (
                <motion.div
                  className="absolute inset-x-0 h-1 bg-[#1A73E8] shadow-lg"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* QR Code Mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className={`w-32 h-32 ${detected ? 'text-[#34A853]' : 'text-white/50'}`} />
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="absolute top-32 inset-x-0 text-center">
            <p className="text-white text-xl font-semibold">
              {detected ? "QR Code Detected!" : scanning ? "Scanning..." : "Position QR code in frame"}
            </p>
            {detected && (
              <p className="text-[#34A853] text-lg mt-2">Loading patient data...</p>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-0 inset-x-0 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">QR Scanner</h1>
          <div className="w-10"></div>
        </div>

        {/* Action Zone */}
        <div className="absolute bottom-0 inset-x-0 px-6 py-6">
          {!scanning && (
            <PrimaryButton onClick={handleScan}>
              Start Scanning
            </PrimaryButton>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

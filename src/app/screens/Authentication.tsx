import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { Fingerprint } from "lucide-react";
import { motion } from "motion/react";

export function Authentication() {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);

  const handleAuth = () => {
    setAuthenticating(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col px-6 pt-24 pb-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
            <p className="text-xl text-[#666666]">CHW Maria</p>
          </div>

          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center mb-8"
            animate={authenticating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: authenticating ? Infinity : 0 }}
          >
            <Fingerprint className="w-16 h-16 text-white" />
          </motion.div>

          <p className="text-[#666666] text-center mb-8">
            {authenticating ? "Authenticating..." : "Touch sensor to authenticate"}
          </p>
        </div>

        {/* Action Zone - Bottom 35% */}
        <div className="space-y-4">
          <PrimaryButton onClick={handleAuth} disabled={authenticating}>
            {authenticating ? "Authenticating..." : "Authenticate with Biometrics"}
          </PrimaryButton>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pt-4">
            <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
            <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
            <div className="w-3 h-3 rounded-full bg-[#1A73E8]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E0E0E0]"></div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

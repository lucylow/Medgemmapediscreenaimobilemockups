import { motion } from "motion/react";
import { RiskLevel } from "../data/mockData";

interface RiskBannerProps {
  risk: RiskLevel;
  compact?: boolean;
  onClick?: () => void;
}

const riskConfig = {
  REFERRAL: {
    color: "#EA4335",
    bg: "bg-[#EA4335]",
    text: "REFERRAL",
    pulse: true,
  },
  URGENT: {
    color: "#FF9800",
    bg: "bg-[#FF9800]",
    text: "URGENT",
    pulse: false,
  },
  MONITOR: {
    color: "#FBBC05",
    bg: "bg-[#FBBC05]",
    text: "MONITOR",
    pulse: false,
  },
  "ON-TRACK": {
    color: "#34A853",
    bg: "bg-[#34A853]",
    text: "ON-TRACK",
    pulse: false,
  },
};

export function RiskBanner({ risk, compact = false, onClick }: RiskBannerProps) {
  const config = riskConfig[risk];
  const height = compact ? "h-[60px]" : risk === "REFERRAL" ? "h-[96px]" : risk === "URGENT" ? "h-[84px]" : "h-[72px]";

  return (
    <motion.div
      className={`${config.bg} ${height} rounded-2xl flex items-center justify-center text-white relative overflow-hidden ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
      animate={config.pulse ? { opacity: [1, 0.8, 1] } : {}}
      transition={config.pulse ? { duration: 1.5, repeat: Infinity } : {}}
      onClick={onClick}
    >
      {config.pulse && (
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ scale: [1, 1.2], opacity: [0.3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <span className={`${compact ? 'text-lg' : 'text-2xl'} font-bold relative z-10`}>
        {config.text}
      </span>
    </motion.div>
  );
}

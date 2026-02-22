import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

type RiskLevel = "on_track" | "monitor" | "urgent" | "referral";

interface RiskBannerProps {
  riskLevel: RiskLevel;
  confidence: number;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

const RISK_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    bg: string;
    textColor: string;
    icon: typeof CheckCircle2;
    pulse: boolean;
  }
> = {
  on_track: {
    label: "On Track",
    bg: "#e6f4ea",
    textColor: "#137333",
    icon: CheckCircle2,
    pulse: false,
  },
  monitor: {
    label: "Monitor",
    bg: "#fef7e0",
    textColor: "#cc6600",
    icon: AlertCircle,
    pulse: false,
  },
  urgent: {
    label: "Urgent",
    bg: "#fce8e6",
    textColor: "#d93025",
    icon: AlertTriangle,
    pulse: true,
  },
  referral: {
    label: "Refer Now",
    bg: "#fce8e6",
    textColor: "#b91c1c",
    icon: XCircle,
    pulse: true,
  },
};

export function RiskBanner({
  riskLevel,
  confidence,
  title,
  subtitle,
  compact = false,
}: RiskBannerProps) {
  const config = RISK_CONFIG[riskLevel];
  const Icon = config.icon;

  return (
    <motion.div
      className={`rounded-3xl relative overflow-hidden ${compact ? "p-4" : "p-6"}`}
      style={{ backgroundColor: config.bg }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {config.pulse && (
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <div className="flex items-center gap-4 relative z-10">
        <div className={`bg-white/30 rounded-2xl ${compact ? "p-2" : "p-3"}`}>
          <Icon
            className={compact ? "w-7 h-7" : "w-10 h-10"}
            style={{ color: config.textColor }}
          />
        </div>
        <div className="flex-1">
          <p
            className={`font-black ${compact ? "text-xl" : "text-2xl"}`}
            style={{ color: config.textColor }}
          >
            {title ?? config.label}
          </p>
          {subtitle && (
            <p
              className="text-lg font-semibold mt-0.5"
              style={{ color: config.textColor }}
            >
              {subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.textColor }}
            />
            <p className="text-sm font-semibold" style={{ color: config.textColor }}>
              Confidence: {(confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

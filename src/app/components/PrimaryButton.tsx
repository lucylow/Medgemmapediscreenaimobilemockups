import { ReactNode } from "react";
import { motion } from "motion/react";
import { hapticImpact } from "../platform/haptics";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "destructive" | "success";
  fullWidth?: boolean;
  disabled?: boolean;
}

const variants = {
  primary: {
    background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
    color: "#0B1120",
    border: "none",
  },
  secondary: {
    background: "rgba(148,163,184,0.14)",
    color: "#E5E7EB",
    border: "1px solid rgba(148,163,184,0.3)",
  },
  destructive: {
    background: "linear-gradient(135deg, #DC2626, #EF4444)",
    color: "#FFFFFF",
    border: "none",
  },
  success: {
    background: "linear-gradient(135deg, #16A34A, #22C55E)",
    color: "#0B1120",
    border: "none",
  },
};

export function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = true,
  disabled = false,
}: PrimaryButtonProps) {
  const style = variants[variant];
  return (
    <motion.button
      className={`h-[56px] ${fullWidth ? "w-full" : "px-8"} rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ background: style.background, color: style.color, border: style.border }}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={() => {
        if (!disabled) hapticImpact("medium");
        onClick?.();
      }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

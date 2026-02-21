import { ReactNode } from "react";
import { motion } from "motion/react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "destructive" | "success";
  fullWidth?: boolean;
  disabled?: boolean;
}

const variants = {
  primary: "bg-[#1A73E8] text-white",
  secondary: "bg-white text-[#1A73E8] border-2 border-[#1A73E8]",
  destructive: "bg-[#EA4335] text-white",
  success: "bg-[#34A853] text-white",
};

export function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = true,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <motion.button
      className={`h-[60px] ${fullWidth ? 'w-full' : 'px-8'} ${variants[variant]} rounded-2xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

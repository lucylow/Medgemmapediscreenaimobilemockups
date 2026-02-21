import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className={`w-full max-w-[430px] h-[932px] bg-[#050814] overflow-auto shadow-2xl rounded-[40px] relative ${className}`}>
        <div className="absolute inset-0 rounded-[40px] pointer-events-none" style={{ background: "linear-gradient(180deg, #050814 0%, #0F172A 100%)" }} />
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

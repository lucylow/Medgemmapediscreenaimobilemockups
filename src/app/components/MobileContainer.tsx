import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className={`w-full max-w-[430px] h-[932px] bg-white overflow-auto shadow-2xl rounded-[40px] ${className}`}>
        {children}
      </div>
    </div>
  );
}

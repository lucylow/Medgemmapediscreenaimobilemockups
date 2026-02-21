import { ShieldCheck } from "lucide-react";

export function DisclaimerFooter() {
  return (
    <div className="bg-[#F8F9FA] border-t border-gray-100 px-4 py-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#999999] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#999999] leading-relaxed">
          PediScreen AI provides developmental screening support only. It does not make diagnoses.
          Always discuss concerns with a licensed health professional.
        </p>
      </div>
    </div>
  );
}

import { ShieldCheck } from "lucide-react";

export function DisclaimerFooter() {
  return (
    <div className="border-t px-4 py-3" style={{ backgroundColor: "rgba(15,23,42,0.85)", borderColor: "rgba(148,163,184,0.15)" }}>
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          PediScreen AI provides developmental screening support only. It does not make diagnoses.
          Always discuss concerns with a licensed health professional.
        </p>
      </div>
    </div>
  );
}

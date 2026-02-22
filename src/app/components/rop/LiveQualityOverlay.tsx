import { motion } from "motion/react";
import type { ImageQualityMetrics } from "../../rop/ropTypes";

interface LiveQualityOverlayProps {
  quality: number;
  metrics: ImageQualityMetrics;
  gestationalAge: number;
  postMenstrualAge: number;
  showGuidance?: boolean;
}

export function LiveQualityOverlay({
  quality,
  metrics,
  gestationalAge,
  postMenstrualAge,
  showGuidance = true,
}: LiveQualityOverlayProps) {
  const qualityColor =
    quality >= 90 ? "#34A853" : quality >= 75 ? "#FBBC05" : "#EA4335";

  return (
    <div className="space-y-3">
      <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: qualityColor }}
            />
            <span className="text-white text-lg font-bold">
              Quality: {quality}%
            </span>
          </div>
          <span className="text-xs text-white/60">
            GA: {gestationalAge}w · PMA: {postMenstrualAge}w
          </span>
        </div>

        <div className="w-full bg-white/15 rounded-full h-2 mb-3">
          <motion.div
            className="h-2 rounded-full"
            style={{ backgroundColor: qualityColor }}
            animate={{ width: `${quality}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Pupil", value: metrics.pupilDilation },
            { label: "Focus", value: metrics.focusSharpness },
            { label: "Light", value: metrics.lightingEvenness },
            { label: "Vascular", value: metrics.vascularContrast },
          ].map((m) => {
            const v = (m.value * 100).toFixed(0);
            const c = m.value >= 0.85 ? "#34A853" : m.value >= 0.7 ? "#FBBC05" : "#EA4335";
            return (
              <div key={m.label}>
                <p className="text-white/50 text-[10px]">{m.label}</p>
                <p className="text-xs font-mono" style={{ color: c }}>
                  {v}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {showGuidance && quality < 75 && (
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-[#FBBC05] text-xs font-bold mb-1">
            Clinical Guidance:
          </p>
          <p className="text-white/80 text-[11px]">• 45° indirect ophthalmoscope</p>
          <p className="text-white/80 text-[11px]">• Center optic disc</p>
          <p className="text-white/80 text-[11px]">• Ensure dilated pupil &gt;6mm</p>
        </div>
      )}
    </div>
  );
}

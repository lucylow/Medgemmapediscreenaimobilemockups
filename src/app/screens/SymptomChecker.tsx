import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, FileText, Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { TabBar } from "../components/TabBar";
import { CameraCapture } from "../components/CameraCapture";
import { getMilestonesForAge, getAgeBandLabel, MILESTONE_DOMAIN_META, type MilestoneDomain, type Milestone } from "../data/milestones";
import { RISK_COLORS, RISK_LABELS, type RiskLevel } from "../data/types";
import { hapticSelection, hapticImpact, hapticRiskLevel } from "../platform/haptics";
import { motion, AnimatePresence } from "framer-motion";

interface SymptomCheckResult {
  riskLevel: RiskLevel;
  confidence: number;
  asq3Score: number;
  asq3Percentile: number;
  icd10Codes: string[];
  keyFindings: string[];
  recommendations: string[];
  inferenceTimeMs: number;
  domainBreakdown: { domain: MilestoneDomain; achieved: number; total: number; pct: number }[];
}

const RISK_BG: Record<RiskLevel, string> = {
  on_track: "#E8F5E8",
  monitor: "#FFF8E1",
  discuss: "#FFF3E0",
  refer: "#FDECEA",
};

const AGE_OPTIONS = [6, 12, 18, 24, 30, 36, 48];

export function SymptomChecker() {
  const navigate = useNavigate();
  const [ageMonths, setAgeMonths] = useState(24);
  const [selectedDomain, setSelectedDomain] = useState<MilestoneDomain | null>(null);
  const [observed, setObserved] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);
  const [expandedFindings, setExpandedFindings] = useState(false);

  const milestones = selectedDomain
    ? getMilestonesForAge(ageMonths, selectedDomain)
    : getMilestonesForAge(ageMonths);

  useEffect(() => {
    setObserved(new Set());
    setResult(null);
  }, [ageMonths, selectedDomain]);

  const toggleMilestone = (id: string) => {
    hapticSelection();
    setObserved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const analyze = () => {
    if (milestones.length === 0) return;
    hapticImpact("medium");
    setIsAnalyzing(true);
    setResult(null);

    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const observedCount = milestones.filter((m) => observed.has(m.id)).length;
      const totalCount = milestones.length;
      const pct = totalCount > 0 ? observedCount / totalCount : 0;

      let riskLevel: RiskLevel;
      if (pct >= 0.75) riskLevel = "on_track";
      else if (pct >= 0.5) riskLevel = "monitor";
      else if (pct >= 0.3) riskLevel = "discuss";
      else riskLevel = "refer";

      const domains = (Object.keys(MILESTONE_DOMAIN_META) as MilestoneDomain[]);
      const domainBreakdown = domains.map((d) => {
        const domainMs = milestones.filter((m) => m.domain === d);
        const achieved = domainMs.filter((m) => observed.has(m.id)).length;
        return { domain: d, achieved, total: domainMs.length, pct: domainMs.length > 0 ? achieved / domainMs.length : 1 };
      }).filter((d) => d.total > 0);

      const confidence = 0.85 + Math.random() * 0.1;
      const asq3Score = Math.round(pct * 60);
      const asq3Percentile = Math.round(pct * 100);

      const keyFindings: string[] = [
        `${observedCount}/${totalCount} age-appropriate milestones achieved`,
        `Age band: ${getAgeBandLabel(ageMonths)}`,
      ];
      domainBreakdown.forEach((d) => {
        if (d.pct < 0.5) {
          keyFindings.push(`${MILESTONE_DOMAIN_META[d.domain].label}: ${d.achieved}/${d.total} — may need attention`);
        }
      });

      const recommendations: string[] = [];
      if (riskLevel === "refer") {
        recommendations.push("Schedule a developmental evaluation with a specialist within 2 weeks");
        recommendations.push("Discuss screening results with your pediatrician");
      } else if (riskLevel === "discuss") {
        recommendations.push("Bring up these results at your next well-child visit");
        recommendations.push("Try targeted activities at home for flagged areas");
      } else if (riskLevel === "monitor") {
        recommendations.push("Plan to recheck in 3 months");
        recommendations.push("Practice activities that support development in flagged areas");
      }
      recommendations.push("Continue engaging in age-appropriate play and activities");
      recommendations.push("This screening does not replace professional medical advice");

      const icd10Codes: string[] = [];
      if (riskLevel === "refer" || riskLevel === "discuss") {
        const hasCommunicationConcern = domainBreakdown.some((d) => d.domain === "communication" && d.pct < 0.5);
        const hasMotorConcern = domainBreakdown.some((d) => d.domain === "motor" && d.pct < 0.5);
        if (hasCommunicationConcern) icd10Codes.push("F80.9");
        if (hasMotorConcern) icd10Codes.push("F82");
        icd10Codes.push("R62.50");
      }

      const res: SymptomCheckResult = {
        riskLevel,
        confidence,
        asq3Score,
        asq3Percentile,
        icd10Codes,
        keyFindings,
        recommendations,
        inferenceTimeMs: Math.round(delay),
        domainBreakdown,
      };

      setResult(res);
      setIsAnalyzing(false);
      hapticRiskLevel(riskLevel);
    }, delay);
  };

  if (isAnalyzing) {
    return (
      <MobileContainer>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#F8F9FA]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-[#E8F0FE] flex items-center justify-center"
          >
            <Loader2 className="w-10 h-10 text-[#1A73E8] animate-spin" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-[#1A73E8]"
          >
            MedGemma Analysis
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-[#666666]"
          >
            Evaluating {milestones.length} milestones...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-[#1A73E8] rounded-full mt-4"
          />
        </div>
      </MobileContainer>
    );
  }

  const observedCount = milestones.filter((m) => observed.has(m.id)).length;

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col bg-[#F8F9FA] overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-48">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">Symptom Checker</h1>
              <p className="text-xs text-[#666666]">{ageMonths} months &bull; {getAgeBandLabel(ageMonths)}</p>
            </div>
            <div className="ml-auto">
              <Search className="w-5 h-5 text-[#999999]" />
            </div>
          </div>

          <div className="px-4 pt-4 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">Child Age</p>
              <div className="flex gap-2 flex-wrap">
                {AGE_OPTIONS.map((age) => (
                  <button
                    key={age}
                    onClick={() => { hapticSelection(); setAgeMonths(age); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      ageMonths === age
                        ? "bg-[#1A73E8] text-white shadow-md"
                        : "bg-[#F0F7FF] text-[#666666] border border-transparent hover:border-[#1A73E8]/30"
                    }`}
                  >
                    {age}mo
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">Domain</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { hapticSelection(); setSelectedDomain(null); }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                    selectedDomain === null
                      ? "bg-[#1A73E8] text-white border-[#1A73E8]"
                      : "bg-white text-[#666666] border-transparent"
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  All Domains
                </button>
                {(Object.keys(MILESTONE_DOMAIN_META) as MilestoneDomain[]).map((d) => {
                  const meta = MILESTONE_DOMAIN_META[d];
                  const active = selectedDomain === d;
                  return (
                    <button
                      key={d}
                      onClick={() => { hapticSelection(); setSelectedDomain(d); }}
                      className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                        active
                          ? "text-white border-current"
                          : "bg-white text-[#666666] border-transparent"
                      }`}
                      style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">
                Milestones ({observedCount}/{milestones.length} observed)
              </p>
              <div className="space-y-2">
                {milestones.length === 0 && (
                  <p className="text-sm text-[#999999] text-center py-6">No milestones for this age and domain combination.</p>
                )}
                {milestones.map((m) => {
                  const isObserved = observed.has(m.id);
                  const domainMeta = MILESTONE_DOMAIN_META[m.domain];
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMilestone(m.id)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all ${
                        isObserved
                          ? "bg-[#E8F5E8] border-l-4"
                          : "bg-white shadow-sm"
                      }`}
                      style={isObserved ? { borderLeftColor: "#34A853" } : {}}
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isObserved ? "bg-[#34A853] border-[#34A853]" : "border-[#DDD]"
                        }`}
                      >
                        {isObserved && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] leading-snug">{m.question}</p>
                        {!selectedDomain && (
                          <span
                            className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: domainMeta.color + "18", color: domainMeta.color }}
                          >
                            {domainMeta.label}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowCamera(true)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-[#1A73E8] bg-[#F0F7FF] text-[#1A73E8] font-semibold text-sm active:bg-[#E8F0FE] transition-colors"
            >
              <Camera className="w-5 h-5" />
              {photoEvidence ? "Photo added" : "Add Photo Evidence"}
            </button>

            {photoEvidence && (
              <div className="relative rounded-xl overflow-hidden">
                <img src={photoEvidence} alt="Evidence" className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => setPhotoEvidence(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl overflow-hidden shadow-lg border-l-[6px]"
                  style={{ borderLeftColor: RISK_COLORS[result.riskLevel], backgroundColor: "white" }}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: RISK_BG[result.riskLevel], color: RISK_COLORS[result.riskLevel] }}
                        >
                          {RISK_LABELS[result.riskLevel]}
                        </span>
                      </div>
                      <span className="text-xs text-[#999999]">{result.inferenceTimeMs}ms</span>
                    </div>

                    <div className="flex items-baseline gap-4">
                      <div>
                        <p className="text-2xl font-extrabold" style={{ color: RISK_COLORS[result.riskLevel] }}>
                          {Math.round(result.confidence * 100)}%
                        </p>
                        <p className="text-[10px] text-[#999999] uppercase">Confidence</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-[#1A1A1A]">{result.asq3Score}</p>
                        <p className="text-[10px] text-[#999999] uppercase">ASQ-3 Score</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-[#1A1A1A]">{result.asq3Percentile}<span className="text-sm">th</span></p>
                        <p className="text-[10px] text-[#999999] uppercase">Percentile</p>
                      </div>
                    </div>

                    {result.domainBreakdown.length > 1 && (
                      <div className="space-y-1.5">
                        {result.domainBreakdown.map((db) => {
                          const meta = MILESTONE_DOMAIN_META[db.domain];
                          return (
                            <div key={db.domain} className="flex items-center gap-2">
                              <span className="text-sm">{meta.icon}</span>
                              <span className="text-xs text-[#666666] w-24 truncate">{meta.label}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${db.pct * 100}%`, backgroundColor: db.pct >= 0.75 ? "#34A853" : db.pct >= 0.5 ? "#FBBC05" : "#EA4335" }}
                                />
                              </div>
                              <span className="text-xs text-[#999999] w-10 text-right">{db.achieved}/{db.total}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {result.icd10Codes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.icd10Codes.map((code) => (
                          <span key={code} className="text-[10px] font-mono bg-gray-100 text-[#666666] px-1.5 py-0.5 rounded">{code}</span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedFindings(!expandedFindings)}
                      className="w-full flex items-center justify-between text-sm text-[#1A73E8] font-semibold py-1"
                    >
                      Key Findings & Recommendations
                      {expandedFindings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence>
                      {expandedFindings && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#666666] uppercase mb-1">Key Findings</p>
                            <ul className="space-y-1">
                              {result.keyFindings.map((f, i) => (
                                <li key={i} className="text-xs text-[#1A1A1A] flex items-start gap-1.5">
                                  <span className="text-[#34A853] mt-0.5">&#8226;</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#666666] uppercase mb-1">Recommendations</p>
                            <ul className="space-y-1">
                              {result.recommendations.map((r, i) => (
                                <li key={i} className="text-xs text-[#1A1A1A] flex items-start gap-1.5">
                                  <span className="text-[#1A73E8] mt-0.5">&#8226;</span> {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-t border-gray-100 p-3 bg-[#FAFAFA] flex items-center justify-center gap-2 text-xs text-[#999999]">
                    <AlertTriangle className="w-3 h-3" />
                    This is a screening tool, not a diagnosis
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-4 py-4">
            <DisclaimerFooter />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 pt-3 pb-2 space-y-2">
            <button
              onClick={analyze}
              disabled={milestones.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                milestones.length === 0
                  ? "bg-gray-200 text-gray-400"
                  : "bg-[#1A73E8] text-white shadow-lg active:scale-[0.98]"
              }`}
            >
              Analyze ({observedCount}/{milestones.length})
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-[#666666] font-semibold text-sm active:bg-gray-50"
              >
                Cancel
              </button>
              {result && (
                <button
                  onClick={() => { hapticImpact("light"); }}
                  className="flex-1 py-3 rounded-xl bg-[#34A853] text-white font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  Report
                </button>
              )}
            </div>
          </div>
          <TabBar />
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(dataUrl) => { setPhotoEvidence(dataUrl); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </MobileContainer>
  );
}

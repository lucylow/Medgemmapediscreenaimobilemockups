import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import {
  ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, XCircle,
  TrendingUp, Home, ChevronDown, ChevronUp, Stethoscope, Shield, Share2, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiskLevel,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  RISK_LABELS,
  RISK_COLORS,
} from "../data/types";
import { hapticRiskLevel, hapticImpact } from "../platform/haptics";
import { sendRiskAlert } from "../platform/notifications";
import { BlockchainCard } from "../components/BlockchainCard";

const riskIcons: Record<RiskLevel, typeof CheckCircle> = {
  on_track: CheckCircle,
  monitor: AlertCircle,
  discuss: AlertTriangle,
  refer: XCircle,
};

export function ScreeningResults() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { results, getChild, sessions } = useApp();
  const [showClinician, setShowClinician] = useState(false);

  const result = results.find((r) => r.sessionId === sessionId);
  const session = sessions.find((s) => s.id === sessionId);
  const child = result ? getChild(result.childId) : undefined;

  useEffect(() => {
    if (result) {
      hapticRiskLevel(result.overallRisk);
      if (child) {
        sendRiskAlert(child.displayName, result.overallRisk);
      }
    }
  }, [result?.sessionId]);

  if (!result) {
    return (
      <MobileContainer>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <p className="text-[#666666]">Results not found</p>
            <PrimaryButton onClick={() => navigate("/children")}>Go Back</PrimaryButton>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const overallColor = RISK_COLORS[result.overallRisk];
  const OverallIcon = riskIcons[result.overallRisk];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/children")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Screening Results</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <motion.div
            className="rounded-2xl p-6 text-white text-center"
            style={{ backgroundColor: overallColor }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <OverallIcon className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold">{RISK_LABELS[result.overallRisk]}</h2>
            <p className="text-sm mt-2 text-white/90">
              Overall screening result for {child?.displayName || "child"} ({result.ageMonths}mo)
            </p>
          </motion.div>

          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <h3 className="font-bold text-[#1A1A1A] mb-2">For You (Parent/Caregiver)</h3>
            <p className="text-[#1A1A1A] leading-relaxed">{result.parentSummary}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Results by Area</h3>
            <div className="space-y-3">
              {result.domainRisks.map((dr, idx) => {
                const DomainRiskIcon = riskIcons[dr.risk];
                const pct = Math.round((dr.score / dr.maxScore) * 100);
                return (
                  <motion.div
                    key={dr.domain}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{DOMAIN_ICONS[dr.domain]}</span>
                      <span className="font-bold text-[#1A1A1A] flex-1">
                        {DOMAIN_LABELS[dr.domain]}
                      </span>
                      <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: RISK_COLORS[dr.risk] }}
                      >
                        <DomainRiskIcon className="w-3 h-3" />
                        {RISK_LABELS[dr.risk]}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: RISK_COLORS[dr.risk] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                      />
                    </div>
                    <p className="text-sm text-[#666666]">{dr.summary}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Suggested Next Steps</h3>
            <div className="space-y-2">
              {result.nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white border-2 border-gray-100 rounded-xl">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: "#1A73E8" }}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm text-[#1A1A1A]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowClinician(!showClinician)}
            className="w-full flex items-center justify-between p-4 bg-[#F3E5F5] rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#9C27B0]" />
              <span className="font-bold text-[#9C27B0]">For Your Clinician</span>
            </div>
            {showClinician ? (
              <ChevronUp className="w-5 h-5 text-[#9C27B0]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#9C27B0]" />
            )}
          </button>

          <AnimatePresence>
            {showClinician && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border-2 border-[#CE93D8] rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-[#9C27B0] uppercase">
                    AI-Generated Draft — Requires Clinician Review
                  </p>
                  <p className="text-sm text-[#666666] whitespace-pre-line leading-relaxed">
                    {result.clinicianSummary}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Shield className="w-4 h-4 text-[#34A853]" />
                    <span className="text-xs text-[#34A853] font-semibold">
                      Safety checks applied · Screening language only
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <BlockchainCard
            screeningId={result.sessionId}
            report={{ overallRisk: result.overallRisk, ageMonths: result.ageMonths, domains: result.domainRisks }}
            childName={child?.displayName || "Unknown"}
            riskLevel={result.overallRisk}
          />

          <div className="bg-[#E8F0FE] rounded-2xl p-4">
            <p className="text-sm text-[#1A73E8]">
              An AI assistant prepared this screening summary. Take this to your child's doctor,
              nurse, or health worker. Do not make major decisions based on this app alone.
            </p>
          </div>

          <div className="text-xs text-[#999999] text-center space-y-1">
            <p>Model: {result.modelProvenance.modelId} v{result.modelProvenance.version}</p>
            <p>Screened: {new Date(result.createdAt).toLocaleDateString()}</p>
            <p>Session: {result.sessionId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-2">
          {child && (
            <>
              <PrimaryButton
                variant="secondary"
                onClick={() => navigate(`/timeline/${child.id}`)}
              >
                <TrendingUp className="w-5 h-5 mr-2 inline" />
                View Timeline
              </PrimaryButton>
              <button
                onClick={() => navigate(`/qr-card/${child.id}`)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform min-h-[52px]"
              >
                <QrCode className="w-5 h-5" />
                Share as QR Code
              </button>
            </>
          )}
          <PrimaryButton onClick={() => navigate("/children")}>
            <Home className="w-5 h-5 mr-2 inline" />
            Back to Children
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, ShieldCheck, Eye, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import {
  RISK_LABELS,
  RISK_COLORS,
} from "../data/types";

export function ClinicianReview() {
  const navigate = useNavigate();
  const { results, getChild, sessions } = useApp();

  const sortedResults = [...results].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Clinician Review</h1>
            <p className="text-sm text-[#9C27B0]">Demo Mode</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-[#F3E5F5] rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#9C27B0] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#9C27B0]">
              This view shows AI-generated draft summaries that require clinician review 
              before being shared with families. In production, this would be a separate 
              authenticated interface.
            </p>
          </div>

          {sortedResults.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Eye className="w-16 h-16 text-[#E0E0E0] mx-auto" />
              <p className="text-[#666666]">No screenings to review yet.</p>
              <p className="text-sm text-[#999999]">
                Complete a screening from the parent or CHW view to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedResults.map((result, idx) => {
                const child = getChild(result.childId);
                const session = sessions.find((s) => s.id === result.sessionId);
                return (
                  <motion.div
                    key={result.sessionId}
                    className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ backgroundColor: RISK_COLORS[result.overallRisk] + "15" }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: RISK_COLORS[result.overallRisk] }}
                        />
                        <span className="font-bold text-[#1A1A1A]">
                          {child?.displayName || "Unknown"} · {result.ageMonths}mo
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: RISK_COLORS[result.overallRisk] }}
                      >
                        {RISK_LABELS[result.overallRisk]}
                      </span>
                    </div>

                    <div className="p-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[#FF9800]" />
                          <span className="text-xs font-bold text-[#FF9800] uppercase">
                            AI Draft (Not shown to families)
                          </span>
                        </div>
                        <p className="text-sm text-[#666666] bg-[#FFF8E1] rounded-xl p-3 border border-[#FFE082]">
                          {result.clinicianSummary}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-[#34A853]" />
                          <span className="text-xs font-bold text-[#34A853] uppercase">
                            Clinician-Approved Text (Shared with families)
                          </span>
                        </div>
                        <p className="text-sm text-[#666666] bg-[#E8F5E9] rounded-xl p-3 border border-[#A5D6A7]">
                          {result.parentSummary}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <PrimaryButton
                          variant="primary"
                          fullWidth={false}
                          onClick={() => navigate(`/screening-results/${result.sessionId}`)}
                        >
                          View Full Report
                        </PrimaryButton>
                        <PrimaryButton
                          variant="success"
                          fullWidth={false}
                          onClick={() => alert("In production, this would approve the screening and notify the family.")}
                        >
                          Approve
                        </PrimaryButton>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

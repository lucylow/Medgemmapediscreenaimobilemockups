import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import {
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  RISK_LABELS,
  RISK_COLORS,
} from "../data/types";

export function Timeline() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { getChild, getResultsForChild } = useApp();

  const child = childId ? getChild(childId) : undefined;
  const results = childId ? getResultsForChild(childId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

  if (!child) {
    return (
      <MobileContainer>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <p className="text-[#666666]">Child not found</p>
            <PrimaryButton onClick={() => navigate("/children")}>Go Back</PrimaryButton>
          </div>
        </div>
      </MobileContainer>
    );
  }

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
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">{child.displayName}'s Timeline</h1>
            <p className="text-sm text-[#666666]">{results.length} screening{results.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <Calendar className="w-16 h-16 text-[#E0E0E0]" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">No screenings yet</h2>
              <p className="text-[#666666] max-w-[280px]">
                Complete a screening to see results here
              </p>
              <PrimaryButton onClick={() => navigate(`/child/${childId}/screening-intro`)}>
                Start First Screening
              </PrimaryButton>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {results.map((result, idx) => (
                  <motion.div
                    key={result.sessionId}
                    className="relative pl-14"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div
                      className="absolute left-4 top-4 w-5 h-5 rounded-full border-4 border-white z-10"
                      style={{ backgroundColor: RISK_COLORS[result.overallRisk] }}
                    />
                    <div
                      className="bg-white border-2 border-gray-100 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => navigate(`/screening-results/${result.sessionId}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#666666]">
                          {new Date(result.createdAt).toLocaleDateString()} · {result.ageMonths}mo
                        </span>
                        <div
                          className="px-2 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: RISK_COLORS[result.overallRisk] }}
                        >
                          {RISK_LABELS[result.overallRisk]}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.domainRisks.map((dr) => (
                          <span
                            key={dr.domain}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: RISK_COLORS[dr.risk] + "20",
                              color: RISK_COLORS[dr.risk],
                            }}
                          >
                            {DOMAIN_ICONS[dr.domain]} {DOMAIN_LABELS[dr.domain]}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-end mt-2 text-sm text-[#1A73E8]">
                        View details <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <PrimaryButton onClick={() => navigate(`/child/${childId}/screening-intro`)}>
            New Screening
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

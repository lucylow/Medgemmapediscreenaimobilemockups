import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import {
  DomainType,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_COLORS,
} from "../data/types";

export function DomainSelect() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { currentSession, getChild, setSelectedDomains: applyDomainSelection } = useApp();
  const [selectedDomains, setLocalDomains] = useState<Set<DomainType>>(
    new Set(currentSession?.domains.map((d) => d.domain) || [])
  );

  if (!currentSession) {
    return (
      <MobileContainer>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <p className="text-[#666666]">No active screening session</p>
            <PrimaryButton onClick={() => navigate("/children")}>Go Back</PrimaryButton>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const child = getChild(currentSession.childId);
  const allDomains = currentSession.domains.map((d) => d.domain);

  const toggleDomain = (domain: DomainType) => {
    const next = new Set(selectedDomains);
    if (next.has(domain)) {
      if (next.size > 1) next.delete(domain);
    } else {
      next.add(domain);
    }
    setLocalDomains(next);
  };

  const selectAll = () => setLocalDomains(new Set(allDomains));

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">Screening Domains</h1>
              <p className="text-sm text-[#666666]">
                {child?.displayName} · {currentSession.ageMonths} months
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-[#E8F0FE] rounded-2xl p-4">
            <p className="text-sm text-[#1A73E8]">
              Select the developmental areas to screen. All areas are recommended for a
              complete assessment. You can deselect any area to skip it.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">
              {selectedDomains.size} of {allDomains.length} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-[#1A73E8] font-semibold"
            >
              Select All
            </button>
          </div>

          <div className="space-y-3">
            {allDomains.map((domain, idx) => {
              const isSelected = selectedDomains.has(domain);
              const color = DOMAIN_COLORS[domain];
              const questionCount = currentSession.domains.find(
                (d) => d.domain === domain
              )?.questions.length || 0;

              return (
                <motion.button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all border-2 text-left ${
                    isSelected
                      ? "border-transparent shadow-md"
                      : "border-gray-200 opacity-60"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: color + "12", borderColor: color + "40" }
                      : {}
                  }
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: isSelected ? color + "20" : "#F0F0F0" }}
                  >
                    {DOMAIN_ICONS[domain]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A1A1A]">{DOMAIN_LABELS[domain]}</p>
                    <p className="text-xs text-[#666666]">{questionCount} questions</p>
                  </div>
                  {isSelected ? (
                    <CheckCircle className="w-6 h-6" style={{ color }} />
                  ) : (
                    <Circle className="w-6 h-6 text-[#CCCCCC]" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4">
          <PrimaryButton
            onClick={() => {
              applyDomainSelection(Array.from(selectedDomains));
              navigate(`/screening/${sessionId}/questions`);
            }}
          >
            Start Screening ({selectedDomains.size} area{selectedDomains.size !== 1 ? "s" : ""})
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

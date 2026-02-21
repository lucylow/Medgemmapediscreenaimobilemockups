import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, Check, AlertCircle, Minus, Send } from "lucide-react";
import {
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_COLORS,
} from "../data/types";

export function ScreeningSummary() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { currentSession, setParentConcerns, submitSession } = useApp();
  const [concerns, setConcerns] = useState(currentSession?.parentConcernsText || "");
  const [submitting, setSubmitting] = useState(false);

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

  const totalQuestions = currentSession.domains.reduce((s, d) => s + d.questions.length, 0);
  const answered = currentSession.domains.reduce(
    (s, d) => s + d.questions.filter((q) => q.answer !== null).length,
    0
  );
  const unanswered = totalQuestions - answered;

  const handleSubmit = async () => {
    setParentConcerns(concerns);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    const result = submitSession();
    if (result) {
      navigate(`/screening-results/${result.sessionId}`);
    }
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate(`/screening/${sessionId}/questions`)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Review & Submit</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-[#E8F0FE] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#1A73E8]">Progress</span>
              <span className="text-sm text-[#1A73E8]">{answered}/{totalQuestions} answered</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-[#1A73E8] rounded-full transition-all"
                style={{ width: `${(answered / totalQuestions) * 100}%` }}
              />
            </div>
            {unanswered > 0 && (
              <div className="flex items-center gap-2 mt-3 text-sm text-[#FF9800]">
                <AlertCircle className="w-4 h-4" />
                <span>{unanswered} question{unanswered !== 1 ? "s" : ""} skipped — results may be less complete</span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Answers by Area</h2>
            <div className="space-y-4">
              {currentSession.domains.map((da) => {
                const domainAnswered = da.questions.filter((q) => q.answer !== null).length;
                const domainColor = DOMAIN_COLORS[da.domain];
                return (
                  <div key={da.domain} className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">{DOMAIN_ICONS[da.domain]}</span>
                      <span className="font-bold text-[#1A1A1A]">{DOMAIN_LABELS[da.domain]}</span>
                      <span className="ml-auto text-sm text-[#666666]">
                        {domainAnswered}/{da.questions.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {da.questions.map((q) => (
                        <div key={q.id} className="flex items-center gap-2 text-sm">
                          {q.answer === "yes" ? (
                            <Check className="w-4 h-4 text-[#34A853] flex-shrink-0" />
                          ) : q.answer === "sometimes" ? (
                            <Minus className="w-4 h-4 text-[#FF9800] flex-shrink-0" />
                          ) : q.answer === "not_yet" ? (
                            <AlertCircle className="w-4 h-4 text-[#EA4335] flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span className="text-[#666666] truncate">{q.prompt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-bold text-[#1A1A1A]">
              Any other concerns? (optional)
            </label>
            <p className="text-sm text-[#666666]">
              Share anything else you've noticed about your child's development
            </p>
            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="e.g., My child doesn't seem to respond when I call their name..."
              rows={4}
              className="w-full bg-[#F8F9FA] border-2 border-gray-200 rounded-2xl p-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#1A73E8] focus:outline-none resize-none"
            />
          </div>

          <div className="bg-[#FFF3E0] rounded-2xl p-4">
            <p className="text-sm text-[#E65100]">
              By submitting, an AI assistant will prepare a screening summary. This is not a diagnosis.
              A clinician should review results before any clinical decisions are made.
            </p>
          </div>
        </div>

        <div className="px-6 py-4">
          <PrimaryButton onClick={handleSubmit} disabled={submitting} variant="success">
            {submitting ? (
              "Analyzing..."
            ) : (
              <>
                <Send className="w-5 h-5 mr-2 inline" />
                Submit Screening
              </>
            )}
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

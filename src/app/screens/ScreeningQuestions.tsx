import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, ArrowRight, Check, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DomainType,
  AnswerValue,
  DOMAIN_LABELS,
  DOMAIN_ICONS,
  DOMAIN_COLORS,
} from "../data/types";
import { useSwipeGesture } from "../platform/useSwipeGesture";
import { hapticImpact, hapticNotification } from "../platform/haptics";

export function ScreeningQuestions() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { currentSession, setAnswer, setParentConcerns } = useApp();
  const [domainIdx, setDomainIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showHelper, setShowHelper] = useState(false);

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

  const domains = currentSession.domains;
  const currentDomain = domains[domainIdx];
  const currentQuestion = currentDomain.questions[questionIdx];
  const totalQuestions = domains.reduce((sum, d) => sum + d.questions.length, 0);
  const answeredSoFar = domains.reduce(
    (sum, d) => sum + d.questions.filter((q) => q.answer !== null).length,
    0
  );

  const isLastQuestion = domainIdx === domains.length - 1 && questionIdx === currentDomain.questions.length - 1;

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (!isLastQuestion) goNext();
    },
    onSwipeRight: () => {
      if (canGoPrev) goPrev();
    },
  });

  const handleAnswer = (answer: AnswerValue) => {
    hapticImpact("medium");
    setAnswer(currentDomain.domain, currentQuestion.id, answer);
    setTimeout(() => goNext(), 300);
  };

  const goNext = () => {
    if (questionIdx < currentDomain.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (domainIdx < domains.length - 1) {
      setDomainIdx(domainIdx + 1);
      setQuestionIdx(0);
    } else {
      navigate(`/screening/${sessionId}/summary`);
    }
    setShowHelper(false);
  };

  const goPrev = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else if (domainIdx > 0) {
      setDomainIdx(domainIdx - 1);
      setQuestionIdx(domains[domainIdx - 1].questions.length - 1);
    }
    setShowHelper(false);
  };

  const canGoPrev = domainIdx > 0 || questionIdx > 0;
  const progressPct = ((answeredSoFar) / totalQuestions) * 100;
  const domainColor = DOMAIN_COLORS[currentDomain.domain];

  const answerButtons: { value: AnswerValue; label: string; color: string }[] = [
    { value: "yes", label: "Yes", color: "#34A853" },
    { value: "sometimes", label: "Sometimes", color: "#FF9800" },
    { value: "not_yet", label: "Not Yet", color: "#EA4335" },
  ];

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => {
                if (confirm("Leave screening? Your progress will be lost.")) {
                  navigate("/children");
                }
              }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{DOMAIN_ICONS[currentDomain.domain]}</span>
                <h1 className="text-lg font-bold text-[#1A1A1A]">
                  {DOMAIN_LABELS[currentDomain.domain]}
                </h1>
              </div>
              <p className="text-xs text-[#999999]">
                Question {questionIdx + 1} of {currentDomain.questions.length} · Domain {domainIdx + 1} of {domains.length}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: domainColor }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8" {...swipeHandlers}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div
                className="rounded-2xl p-6"
                style={{ backgroundColor: domainColor + "10", borderLeft: `4px solid ${domainColor}` }}
              >
                <p className="text-xl font-semibold text-[#1A1A1A] leading-relaxed">
                  {currentQuestion.prompt}
                </p>
                {currentQuestion.helperText && (
                  <button
                    onClick={() => setShowHelper(!showHelper)}
                    className="flex items-center gap-1 mt-3 text-sm text-[#666666]"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{showHelper ? "Hide" : "Show"} helpful tip</span>
                  </button>
                )}
                {showHelper && currentQuestion.helperText && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-[#666666] mt-2 bg-white rounded-xl p-3"
                  >
                    {currentQuestion.helperText}
                  </motion.p>
                )}
              </div>

              <div className="space-y-3">
                {answerButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => handleAnswer(btn.value)}
                    className={`w-full h-[64px] rounded-2xl font-semibold text-lg transition-all border-2 flex items-center justify-center gap-3 ${
                      currentQuestion.answer === btn.value
                        ? "text-white shadow-lg scale-[0.98]"
                        : "bg-white text-[#1A1A1A] border-gray-200 active:scale-[0.98]"
                    }`}
                    style={
                      currentQuestion.answer === btn.value
                        ? { backgroundColor: btn.color, borderColor: btn.color }
                        : {}
                    }
                  >
                    {currentQuestion.answer === btn.value && <Check className="w-5 h-5" />}
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className="w-12 h-12 rounded-2xl border-2 border-gray-200 flex items-center justify-center disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            {isLastQuestion ? (
              <PrimaryButton onClick={() => navigate(`/screening/${sessionId}/summary`)}>
                Review Answers
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={goNext}
                variant={currentQuestion.answer ? "primary" : "secondary"}
              >
                {currentQuestion.answer ? (
                  <>
                    Next <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                ) : (
                  "Skip"
                )}
              </PrimaryButton>
            )}
          </div>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}

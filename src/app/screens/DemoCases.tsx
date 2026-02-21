import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { PrimaryButton } from "../components/PrimaryButton";
import { useApp } from "../context/AppContext";
import { Beaker, Play, CheckCircle, AlertCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import * as storage from "../data/storage";
import { evaluateScreening } from "../data/screeningEngine";
import { getQuestionsForAge } from "../data/questions";
import {
  DomainType,
  AnswerValue,
  RISK_COLORS,
  RISK_LABELS,
  RiskLevel,
  DOMAIN_LABELS,
} from "../data/types";

interface DemoCase {
  id: string;
  title: string;
  description: string;
  ageMonths: number;
  expectedRisk: RiskLevel;
  answerPattern: Record<DomainType, AnswerValue>;
}

const demoCases: DemoCase[] = [
  {
    id: "on-track-18",
    title: "18 months — On Track",
    description: "Healthy development across all 5 domains. All milestones met.",
    ageMonths: 18,
    expectedRisk: "on_track",
    answerPattern: {
      communication: "yes",
      gross_motor: "yes",
      fine_motor: "yes",
      social: "yes",
      cognitive: "yes",
    },
  },
  {
    id: "monitor-24",
    title: "24 months — Communication Monitor",
    description: "Mild delay in language/communication. Other domains mostly on track.",
    ageMonths: 24,
    expectedRisk: "monitor",
    answerPattern: {
      communication: "sometimes",
      gross_motor: "yes",
      fine_motor: "yes",
      social: "yes",
      cognitive: "yes",
    },
  },
  {
    id: "discuss-36",
    title: "36 months — Fine Motor Discuss",
    description: "Noticeable fine motor concerns. Some communication emerging later.",
    ageMonths: 36,
    expectedRisk: "discuss",
    answerPattern: {
      communication: "sometimes",
      gross_motor: "yes",
      fine_motor: "not_yet",
      social: "yes",
      cognitive: "sometimes",
    },
  },
  {
    id: "refer-24",
    title: "24 months — Multi-domain Refer",
    description: "Multiple developmental areas flagged. Referral pathway demonstration.",
    ageMonths: 24,
    expectedRisk: "refer",
    answerPattern: {
      communication: "not_yet",
      gross_motor: "sometimes",
      fine_motor: "not_yet",
      social: "not_yet",
      cognitive: "sometimes",
    },
  },
];

const riskIcons: Record<RiskLevel, typeof CheckCircle> = {
  on_track: CheckCircle,
  monitor: AlertCircle,
  discuss: AlertTriangle,
  refer: XCircle,
};

export function DemoCases() {
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const runDemoCase = async (demoCase: DemoCase) => {
    setLoading(demoCase.id);

    const childId = storage.generateId();
    const child = {
      id: childId,
      displayName: `Demo Child (${demoCase.ageMonths}mo)`,
      birthDate: new Date(
        Date.now() - demoCase.ageMonths * 30.44 * 24 * 60 * 60 * 1000
      ).toISOString(),
      createdAt: new Date().toISOString(),
    };
    storage.saveChild(child);

    const ageBand = getQuestionsForAge(demoCase.ageMonths);
    const domains = (Object.keys(ageBand.domains) as DomainType[]).map((domain) => ({
      domain,
      questions: ageBand.domains[domain].map((q) => ({
        ...q,
        answer: demoCase.answerPattern[domain] as AnswerValue,
      })),
    }));

    const session = {
      id: storage.generateId(),
      childId,
      createdAt: new Date().toISOString(),
      ageMonths: demoCase.ageMonths,
      domains,
      parentConcernsText: "",
      media: [],
      status: "submitted" as const,
    };
    storage.saveSession(session);

    const result = evaluateScreening(session);
    storage.saveResult(result);

    refreshData();

    await new Promise((r) => setTimeout(r, 800));
    setLoading(null);
    navigate(`/screening-results/${session.id}`);
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <Beaker className="w-6 h-6 text-[#9C27B0]" />
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">Demo Cases</h1>
              <p className="text-sm text-[#666666]">Preconfigured screening scenarios</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <div className="bg-[#F3E5F5] rounded-2xl p-4">
            <p className="text-sm text-[#9C27B0]">
              Tap a scenario below to instantly generate a screening result. Each case creates a demo child profile with pre-filled answers showing different risk outcomes.
            </p>
          </div>

          {demoCases.map((demoCase, idx) => {
            const Icon = riskIcons[demoCase.expectedRisk];
            const isLoading = loading === demoCase.id;
            return (
              <motion.div
                key={demoCase.id}
                className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: RISK_COLORS[demoCase.expectedRisk] + "15" }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: RISK_COLORS[demoCase.expectedRisk] }}
                  />
                  <span className="font-bold text-[#1A1A1A] flex-1">{demoCase.title}</span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: RISK_COLORS[demoCase.expectedRisk] }}
                  >
                    {RISK_LABELS[demoCase.expectedRisk]}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-[#666666]">{demoCase.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(demoCase.answerPattern) as DomainType[]).map((domain) => {
                      const answer = demoCase.answerPattern[domain];
                      const answerColor =
                        answer === "yes"
                          ? "#34A853"
                          : answer === "sometimes"
                          ? "#FF9800"
                          : "#EA4335";
                      return (
                        <span
                          key={domain}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ backgroundColor: answerColor + "20", color: answerColor }}
                        >
                          {DOMAIN_LABELS[domain]}: {answer === "not_yet" ? "Not yet" : answer === "sometimes" ? "Sometimes" : "Yes"}
                        </span>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => runDemoCase(demoCase)}
                    disabled={!!loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white active:scale-[0.98] transition-transform disabled:opacity-60"
                    style={{ backgroundColor: RISK_COLORS[demoCase.expectedRisk] }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run This Demo
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <TabBar />
      </div>
    </MobileContainer>
  );
}

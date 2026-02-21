import {
  ScreeningSession,
  ScreeningResult,
  DomainRisk,
  DomainType,
  RiskLevel,
  AnswerValue,
  DOMAIN_LABELS,
} from "./types";
import { generateId } from "./storage";

function scoreAnswer(answer: AnswerValue | null): number {
  switch (answer) {
    case "yes": return 10;
    case "sometimes": return 5;
    case "not_yet": return 0;
    default: return 5;
  }
}

function calculateDomainRisk(
  domain: DomainType,
  answers: { answer: AnswerValue | null }[]
): DomainRisk {
  const maxScore = answers.length * 10;
  const score = answers.reduce((sum, a) => sum + scoreAnswer(a.answer), 0);
  const pct = maxScore > 0 ? score / maxScore : 0;

  let risk: RiskLevel;
  if (pct >= 0.75) risk = "on_track";
  else if (pct >= 0.5) risk = "monitor";
  else if (pct >= 0.3) risk = "discuss";
  else risk = "refer";

  const label = DOMAIN_LABELS[domain];
  const summaries: Record<RiskLevel, string> = {
    on_track: `Your child's ${label.toLowerCase()} skills appear to be developing well for their age. Keep up the great interactions and activities!`,
    monitor: `Your child's ${label.toLowerCase()} skills may benefit from extra attention and activities at home. This is common and many children catch up with a little extra support.`,
    discuss: `Some patterns in ${label.toLowerCase()} may be helpful to discuss with your child's health provider. They can offer personalized guidance.`,
    refer: `The screening suggests your child's ${label.toLowerCase()} development could benefit from a professional evaluation. Speaking with a specialist can help identify the best support.`,
  };

  return { domain, risk, score, maxScore, summary: summaries[risk] };
}

function determineOverallRisk(domainRisks: DomainRisk[]): RiskLevel {
  const riskOrder: RiskLevel[] = ["refer", "discuss", "monitor", "on_track"];
  for (const level of riskOrder) {
    if (domainRisks.some((d) => d.risk === level)) return level;
  }
  return "on_track";
}

function generateParentSummary(
  overallRisk: RiskLevel,
  domainRisks: DomainRisk[],
  ageMonths: number
): string {
  const onTrack = domainRisks.filter((d) => d.risk === "on_track");
  const concerns = domainRisks.filter((d) => d.risk !== "on_track");

  let summary = `Based on your answers for your ${ageMonths}-month-old, `;

  if (concerns.length === 0) {
    summary += "your child's skills in all areas seem to be developing well for their age. Keep doing what you're doing!";
  } else if (onTrack.length > 0) {
    const onTrackNames = onTrack.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(", ");
    const concernNames = concerns.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(", ");
    summary += `your child's skills in ${onTrackNames} appear on track. `;
    summary += `The area(s) of ${concernNames} might benefit from extra monitoring and activities at home. `;
    summary += "Discuss these results with your child's health provider for personalized guidance.";
  } else {
    summary += "several developmental areas may benefit from professional evaluation. ";
    summary += "This screening is not a diagnosis — many factors can influence these results. ";
    summary += "Please discuss with your child's health provider who can offer the best guidance.";
  }

  return summary;
}

function generateClinicianSummary(
  domainRisks: DomainRisk[],
  ageMonths: number
): string {
  const lines = domainRisks.map((d) => {
    const pct = Math.round((d.score / d.maxScore) * 100);
    return `${DOMAIN_LABELS[d.domain]}: ${d.score}/${d.maxScore} (${pct}%) — ${d.risk.toUpperCase()}`;
  });

  return `AI-assisted screening summary for ${ageMonths}-month-old child.\n\n${lines.join("\n")}\n\nNote: This is an AI-generated draft. Clinician review is required before sharing results with families.`;
}

function generateNextSteps(
  overallRisk: RiskLevel,
  domainRisks: DomainRisk[]
): string[] {
  const steps: string[] = [];

  const referDomains = domainRisks.filter((d) => d.risk === "refer");
  const discussDomains = domainRisks.filter((d) => d.risk === "discuss");
  const monitorDomains = domainRisks.filter((d) => d.risk === "monitor");

  if (referDomains.length > 0) {
    referDomains.forEach((d) => {
      steps.push(`Consider scheduling an evaluation with a ${DOMAIN_LABELS[d.domain].toLowerCase()} specialist`);
    });
    steps.push("Discuss these screening results with your child's pediatrician at the next visit");
  }

  if (discussDomains.length > 0) {
    steps.push("Bring up these screening areas at your next well-child visit");
    discussDomains.forEach((d) => {
      steps.push(`Try activities at home that support ${DOMAIN_LABELS[d.domain].toLowerCase()} development`);
    });
  }

  if (monitorDomains.length > 0) {
    steps.push("Plan to recheck these areas in 3 months");
    steps.push("Practice fun activities that encourage development in flagged areas");
  }

  if (overallRisk === "on_track") {
    steps.push("Continue engaging in age-appropriate play and activities");
    steps.push("Schedule routine screening again in 6 months");
  }

  steps.push("Remember: this screening does not replace professional medical advice");

  return steps;
}

export function evaluateScreening(session: ScreeningSession): ScreeningResult {
  const domainRisks: DomainRisk[] = session.domains.map((da) =>
    calculateDomainRisk(da.domain, da.questions)
  );

  const overallRisk = determineOverallRisk(domainRisks);
  const parentSummary = generateParentSummary(overallRisk, domainRisks, session.ageMonths);
  const clinicianSummary = generateClinicianSummary(domainRisks, session.ageMonths);
  const nextSteps = generateNextSteps(overallRisk, domainRisks);

  return {
    sessionId: session.id,
    createdAt: new Date().toISOString(),
    childId: session.childId,
    ageMonths: session.ageMonths,
    overallRisk,
    domainRisks,
    parentSummary,
    clinicianSummary,
    nextSteps,
    modelProvenance: {
      modelId: "medgemma-pediscreen",
      version: "1.0.0-demo",
    },
  };
}

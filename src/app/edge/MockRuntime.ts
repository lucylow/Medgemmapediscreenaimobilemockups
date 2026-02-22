import { LocalModelRuntime } from "./LocalModelRuntime";
import {
  LocalInferenceResult,
  LocalSummaryResult,
  SummaryInput,
  EdgeDomainRisk,
} from "./inferenceSchemas";
import { DomainType, RiskLevel, DOMAIN_LABELS } from "../data/types";

function scoreToRisk(score: number): RiskLevel {
  if (score >= 0.75) return "on_track";
  if (score >= 0.5) return "monitor";
  if (score >= 0.3) return "discuss";
  return "refer";
}

export class MockRuntime implements LocalModelRuntime {
  private initTime = 0;

  async initialize(): Promise<void> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 300));
    this.initTime = performance.now() - start;
  }

  getModelInfo() {
    return { modelId: "medgemma-pediscreen-mock", version: "1.0.0-demo" };
  }

  async runRiskModel(features: Float32Array): Promise<LocalInferenceResult> {
    await new Promise((res) => setTimeout(res, 400 + Math.random() * 200));

    const domains: DomainType[] = ["communication", "gross_motor", "fine_motor", "social", "cognitive"];

    const domainRisks: EdgeDomainRisk[] = domains.map((domain, i) => {
      const rawScore = features[i + 1];
      const jitter = (Math.random() - 0.5) * 0.1;
      const score = Math.max(0, Math.min(1, rawScore + jitter));
      return { domain, risk: scoreToRisk(score), score };
    });

    const overallScore = domainRisks.reduce((s, d) => s + d.score, 0) / domainRisks.length;
    const overallRisk = scoreToRisk(overallScore);

    const strengths = domainRisks
      .filter((d) => d.risk === "on_track")
      .map((d) => `${DOMAIN_LABELS[d.domain]} skills appear on track`);

    const watchAreas = domainRisks
      .filter((d) => d.risk !== "on_track")
      .map((d) => DOMAIN_LABELS[d.domain]);

    const keyFindings = domainRisks
      .filter((d) => d.risk === "monitor" || d.risk === "discuss" || d.risk === "refer")
      .map((d) => `${DOMAIN_LABELS[d.domain]} may benefit from additional support`);

    return {
      sessionId: "edge_session",
      overallRisk,
      overallScore,
      domainRisks,
      keyFindings,
      strengths,
      watchAreas,
    };
  }

  async runSummaryModel({ sessionId, ageMonths, inference, parentConcerns }: SummaryInput): Promise<LocalSummaryResult> {
    await new Promise((res) => setTimeout(res, 300 + Math.random() * 200));

    const onTrack = inference.domainRisks.filter((d) => d.risk === "on_track");
    const concerns = inference.domainRisks.filter((d) => d.risk !== "on_track");

    let parentSummary: string;
    if (concerns.length === 0) {
      parentSummary = `This screening suggests your ${ageMonths}-month-old is developing well across all areas assessed. Keep up the great work with your child's learning and play activities!`;
    } else {
      const concernNames = concerns.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(" and ");
      const strengthNames = onTrack.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(", ");
      parentSummary = `This screening suggests your child is doing well in ${strengthNames || "several areas"}. The area(s) of ${concernNames} may benefit from extra attention. This does not mean anything is wrong — many children catch up with a little extra support. Consider discussing these results with your child's health provider.`;
    }

    const domainLines = inference.domainRisks.map(
      (d) => `${DOMAIN_LABELS[d.domain]}: ${(d.score * 100).toFixed(0)}% — ${d.risk.toUpperCase()}`
    );
    const clinicianSummary = `Edge AI screening for ${ageMonths}-month-old child.\n${domainLines.join("\n")}\nOverall: ${inference.overallRisk.toUpperCase()} (${(inference.overallScore * 100).toFixed(0)}%)\nNote: AI-generated draft. Clinician review required.`;

    const nextSteps: string[] = [];
    if (concerns.length > 0) {
      nextSteps.push("Share this summary with your child's doctor, nurse, or health worker.");
      concerns.forEach((d) => {
        nextSteps.push(`Try activities at home that support ${DOMAIN_LABELS[d.domain].toLowerCase()} development.`);
      });
    }
    nextSteps.push("Repeat this screening in 3–6 months or sooner if you have concerns.");
    nextSteps.push("Remember: this screening does not replace professional medical advice.");

    return { parentSummary, clinicianSummary, nextSteps };
  }
}

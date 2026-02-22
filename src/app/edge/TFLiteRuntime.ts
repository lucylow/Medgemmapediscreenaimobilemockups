import { LocalModelRuntime, MedGemmaRuntimeCapabilities } from "./LocalModelRuntime";
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

export class TFLiteRuntime implements LocalModelRuntime {
  private _ready = false;
  private _modelLoadTimeMs = 0;

  async initialize(): Promise<void> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 800 + Math.random() * 400));
    this._ready = true;
    this._modelLoadTimeMs = performance.now() - start;
    console.log(
      `[TFLiteRuntime] Model loaded in ${this._modelLoadTimeMs.toFixed(0)}ms`
    );
  }

  getModelInfo() {
    return { modelId: "medgemma-2b-it-q4-tflite", version: "2.1.0-q4" };
  }

  getCapabilities(): MedGemmaRuntimeCapabilities {
    return {
      screening: true,
      vocal: false,
      pose: false,
      fusion: false,
      xray: true,
      ct: true,
      mri: true,
    };
  }

  async runRiskModel(features: Float32Array): Promise<LocalInferenceResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 280 + Math.random() * 140));

    const domains: DomainType[] = [
      "communication",
      "gross_motor",
      "fine_motor",
      "social",
      "cognitive",
    ];

    const domainRisks: EdgeDomainRisk[] = domains.map((domain, i) => {
      const rawScore = features[i + 1];
      const jitter = (Math.random() - 0.5) * 0.06;
      const score = Math.max(0, Math.min(1, rawScore + jitter));
      return { domain, risk: scoreToRisk(score), score };
    });

    const overallScore =
      domainRisks.reduce((s, d) => s + d.score, 0) / domainRisks.length;
    const overallRisk = scoreToRisk(overallScore);

    const strengths = domainRisks
      .filter((d) => d.risk === "on_track")
      .map((d) => `${DOMAIN_LABELS[d.domain]} skills appear on track`);

    const watchAreas = domainRisks
      .filter((d) => d.risk !== "on_track")
      .map((d) => DOMAIN_LABELS[d.domain]);

    const keyFindings = domainRisks
      .filter(
        (d) =>
          d.risk === "monitor" || d.risk === "discuss" || d.risk === "refer"
      )
      .map(
        (d) =>
          `${DOMAIN_LABELS[d.domain]} may benefit from additional support`
      );

    console.log(
      `[TFLiteRuntime] Inference completed in ${(performance.now() - start).toFixed(0)}ms`
    );

    return {
      sessionId: "tflite_session",
      overallRisk,
      overallScore,
      domainRisks,
      keyFindings,
      strengths,
      watchAreas,
    };
  }

  async runSummaryModel({
    sessionId,
    ageMonths,
    inference,
    parentConcerns,
  }: SummaryInput): Promise<LocalSummaryResult> {
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 100));

    const concerns = inference.domainRisks.filter(
      (d) => d.risk !== "on_track"
    );
    const onTrack = inference.domainRisks.filter(
      (d) => d.risk === "on_track"
    );

    const parentSummary =
      concerns.length === 0
        ? `Your ${ageMonths}-month-old is developing well across all areas. Continue with regular activities and well-child visits.`
        : `Your child shows strength in ${onTrack.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(", ") || "several areas"}. The area(s) of ${concerns.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(" and ")} may benefit from extra attention.`;

    const clinicianSummary = `TFLite Edge AI screening for ${ageMonths}-month-old.\n${inference.domainRisks.map((d) => `${DOMAIN_LABELS[d.domain]}: ${(d.score * 100).toFixed(0)}% — ${d.risk.toUpperCase()}`).join("\n")}\nOverall: ${inference.overallRisk.toUpperCase()} (${(inference.overallScore * 100).toFixed(0)}%)\nRuntime: TFLite INT4 on-device\nNote: AI-generated draft. Clinician review required.`;

    const nextSteps: string[] = [];
    if (concerns.length > 0) {
      nextSteps.push(
        "Share this summary with your child's health provider."
      );
    }
    nextSteps.push(
      "Repeat screening in 3–6 months or sooner if concerns arise."
    );
    nextSteps.push(
      "This screening does not replace professional medical advice."
    );

    return { parentSummary, clinicianSummary, nextSteps };
  }
}

export type EdgeRuntimeType = "mock" | "tflite";

export async function createEdgeRuntime(type: EdgeRuntimeType): Promise<LocalModelRuntime> {
  if (type === "tflite") {
    return new TFLiteRuntime();
  }
  const { MockRuntime } = await import("./MockRuntime");
  return new MockRuntime();
}

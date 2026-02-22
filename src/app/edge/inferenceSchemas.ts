import { DomainType, RiskLevel, AnswerValue } from "../data/types";

export interface StructuredFeatures {
  ageMonths: number;
  domainScores: Record<DomainType, number>;
  concernsLength: number;
  mediaCount: number;
  totalQuestions: number;
  totalAnswered: number;
}

export interface EdgeDomainRisk {
  domain: DomainType;
  risk: RiskLevel;
  score: number;
}

export interface LocalInferenceResult {
  sessionId: string;
  overallRisk: RiskLevel;
  overallScore: number;
  domainRisks: EdgeDomainRisk[];
  keyFindings: string[];
  strengths: string[];
  watchAreas: string[];
}

export interface LocalSummaryResult {
  parentSummary: string;
  clinicianSummary: string;
  nextSteps: string[];
}

export interface SummaryInput {
  sessionId: string;
  ageMonths: number;
  inference: LocalInferenceResult;
  parentConcerns: string;
}

export interface ModelProvenance {
  modelId: string;
  version: string;
  runtime: "mock" | "local-model";
}

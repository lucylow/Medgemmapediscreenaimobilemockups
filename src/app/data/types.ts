export type DomainType = "communication" | "gross_motor" | "fine_motor" | "social" | "cognitive";

export type AnswerValue = "yes" | "sometimes" | "not_yet";

export type RiskLevel = "on_track" | "monitor" | "discuss" | "refer";

export type UserRole = "parent" | "chw" | "clinician";

export type SessionStatus = "draft" | "submitted" | "reviewed";

export interface Child {
  id: string;
  displayName: string;
  birthDate: string;
  sex?: "male" | "female" | "other" | "prefer_not_to_say";
  primaryLanguage?: string;
  createdAt: string;
}

export interface QuestionAnswer {
  id: string;
  prompt: string;
  helperText?: string;
  answer: AnswerValue | null;
}

export interface DomainAnswer {
  domain: DomainType;
  questions: QuestionAnswer[];
}

export interface MediaAttachment {
  id: string;
  type: "photo" | "drawing" | "video_frame";
  uri: string;
  localOnly?: boolean;
}

export interface ScreeningSession {
  id: string;
  childId: string;
  createdAt: string;
  ageMonths: number;
  domains: DomainAnswer[];
  parentConcernsText: string;
  media: MediaAttachment[];
  status: SessionStatus;
}

export interface DomainRisk {
  domain: DomainType;
  risk: RiskLevel;
  score: number;
  maxScore: number;
  summary: string;
}

export interface ScreeningResult {
  sessionId: string;
  createdAt: string;
  childId: string;
  ageMonths: number;
  overallRisk: RiskLevel;
  domainRisks: DomainRisk[];
  parentSummary: string;
  clinicianSummary: string;
  nextSteps: string[];
  modelProvenance: { modelId: string; version: string };
}

export const DOMAIN_LABELS: Record<DomainType, string> = {
  communication: "Communication",
  gross_motor: "Gross Motor",
  fine_motor: "Fine Motor",
  social: "Personal-Social",
  cognitive: "Problem Solving",
};

export const DOMAIN_ICONS: Record<DomainType, string> = {
  communication: "💬",
  gross_motor: "🏃",
  fine_motor: "✋",
  social: "👫",
  cognitive: "🧩",
};

export const DOMAIN_COLORS: Record<DomainType, string> = {
  communication: "#1A73E8",
  gross_motor: "#34A853",
  fine_motor: "#FF9800",
  social: "#EA4335",
  cognitive: "#9C27B0",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  on_track: "On Track",
  monitor: "Monitor",
  discuss: "Discuss with Provider",
  refer: "Consider Referral",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  on_track: "#34A853",
  monitor: "#FBBC05",
  discuss: "#FF9800",
  refer: "#EA4335",
};

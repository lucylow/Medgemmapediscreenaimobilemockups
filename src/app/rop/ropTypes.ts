export type ROPZone = "I" | "II" | "III";
export type ROPStage = 0 | 1 | 2 | 3 | 4 | 5;
export type ROPPriority = "immediate" | "high" | "medium" | "low";
export type ROPEvidenceLevel = "A" | "B" | "C";

export interface ImageQualityMetrics {
  pupilDilation: number;
  focusSharpness: number;
  lightingEvenness: number;
  vascularContrast: number;
  overall: number;
}

export interface ROPMetadata {
  gestationalAge: number;
  postMenstrualAge: number;
  quality: number;
}

export interface ROPScreeningResult {
  zone: ROPZone;
  stage: ROPStage;
  plusDisease: boolean;
  tortuosity: number;
  dilation: number;
  etropType: string;
  confidence: number;
  qualityMetrics: ImageQualityMetrics;
  keyFindings: string[];
  clinicalSummary: string;
  recommendations: ROPRecommendation[];
  latencyMs: number;
}

export interface ROPRecommendation {
  priority: ROPPriority;
  action: string;
  timeline: "immediate" | "7d" | "14d" | "28d";
  evidence_level: ROPEvidenceLevel;
}

export interface ASQ3Equivalent {
  raw_score: number;
  percentile: number;
  cutoff_flag: boolean;
  domain_breakdown: Record<string, number>;
}

export interface ClinicalRecommendation {
  priority: ROPPriority;
  action: string;
  timeline: "immediate" | "7d" | "14d" | "28d";
  evidence_level: ROPEvidenceLevel;
}

export interface EnhancedScreeningResult {
  risk_level: "on_track" | "monitor" | "urgent" | "referral";
  confidence: number;
  asq3_equivalent: ASQ3Equivalent;
  icd10_codes: string[];
  key_findings: string[];
  clinical_summary: string;
  recommendations: ClinicalRecommendation[];
  latencyMs: number;
  modelVersion: string;
}

export interface PediatricScreeningInput {
  childAgeMonths: number;
  gender: "M" | "F" | "Other";
  parentName: string;
  setting: "home" | "clinic" | "field";
  domain?: "communication" | "motor" | "social" | "cognitive" | "comprehensive";
  parentReport: string;
  chwObservations?: string;
  multimodal?: {
    imageQuality: number;
    pupilScore: number;
    audioClarity: number;
    audioDuration: number;
  };
}

export interface ROPAnalysisInput {
  frameData: Uint8Array;
  metadata: ROPMetadata;
}

export const ROP_ZONE_COLORS: Record<ROPZone, string> = {
  I: "#EA4335",
  II: "#FF9800",
  III: "#34A853",
};

export const ROP_RISK_CONFIG = {
  on_track: { color: "#e6f4ea", textColor: "#137333", label: "On Track" },
  monitor: { color: "#fef7e0", textColor: "#cc6600", label: "Monitor" },
  urgent: { color: "#fce8e6", textColor: "#d93025", label: "Urgent" },
  referral: { color: "#fee", textColor: "#b91c1c", label: "Refer Now" },
} as const;

export const PIPELINE_STEPS = [
  { name: "Whisper Transcription", time: 0.8, color: "#4285f4", icon: "🎤" },
  { name: "MedSigLIP Vision", time: 1.2, color: "#34a853", icon: "👁️" },
  { name: "MedGemma Inference", time: 2.1, color: "#ea4335", icon: "🧠" },
  { name: "Risk Stratification", time: 0.6, color: "#fbbc05", icon: "📊" },
] as const;

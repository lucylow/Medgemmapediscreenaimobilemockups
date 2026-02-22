export type CTModality = "CT_HEAD" | "CT_ABDOMEN" | "CT_CHEST" | "CT_MS" | "CBCT_DENTAL";

export type CTRiskTier = "ON_TRACK" | "MONITOR" | "REFER" | "CRITICAL";

export interface CTVolumeMeta {
  id: string;
  seriesInstanceUID: string;
  studyInstanceUID: string;
  modality: CTModality;
  sliceCount: number;
  rows: number;
  cols: number;
  voxelSpacing: [number, number, number];
  hounsfieldRange: [number, number];
  acquisitionDateTime?: string;
  patientAgeMonths?: number;
  anonymized: boolean;
  sourcePath: string;
}

export interface CTVolume {
  meta: CTVolumeMeta;
  data: Float32Array;
}

export interface CTDomainScores {
  hemorrhageRisk: number;
  fractureRisk: number;
  necRisk: number;
  tumorBurden: number;
}

export interface CTInferenceResult {
  volumeId: string;
  domainScores: CTDomainScores;
  riskTier: CTRiskTier;
  keyFindings: string[];
  clinicalSummary: string;
  latencyMs: number;
  modelVersion: string;
  useCaseFlags: CTUseCaseFlag[];
}

export interface CTUseCaseFlag {
  useCase: string;
  code: string;
  probability: number;
  triggered: boolean;
}

export interface CTSeriesEntry {
  id: string;
  timestamp: number;
  modality: CTModality;
  sliceCount: number;
  riskTier: CTRiskTier;
  domainScores: CTDomainScores;
  latencyMs: number;
  keyFindings: string[];
}

export interface CTSliceData {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

export const CT_MODALITY_LABELS: Record<CTModality, string> = {
  CT_HEAD: "CT Head",
  CT_ABDOMEN: "CT Abdomen",
  CT_CHEST: "CT Chest",
  CT_MS: "CT Musculoskeletal",
  CBCT_DENTAL: "CBCT Dental",
};

export const CT_RISK_COLORS: Record<CTRiskTier, string> = {
  ON_TRACK: "#34A853",
  MONITOR: "#F9AB00",
  REFER: "#EA4335",
  CRITICAL: "#B71C1C",
};

export const CT_RISK_LABELS: Record<CTRiskTier, string> = {
  ON_TRACK: "On Track",
  MONITOR: "Monitor",
  REFER: "Refer",
  CRITICAL: "Critical",
};

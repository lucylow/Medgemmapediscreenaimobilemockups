export type MRIScanType =
  | "T1_MPRAGE"
  | "T2_SPACE"
  | "DTI"
  | "SWI"
  | "CISS"
  | "FLAIR"
  | "ASL"
  | "fMRI";

export interface MRIVolumeMeta {
  id: string;
  seriesInstanceUID: string;
  studyInstanceUID: string;
  modality: MRIScanType;
  sliceCount: number;
  rows: number;
  cols: number;
  voxelSpacing: [number, number, number];
  TR: number;
  TE: number;
  acquisitionDateTime?: string;
  patientAgeMonths: number;
  motionScore?: number;
  anonymized: boolean;
  sourcePath: string;
}

export interface MRIVolume {
  meta: MRIVolumeMeta;
  data: Float32Array;
}

export interface MRIDomainScores {
  brainAgeGapMonths: number;
  corticalThickness: number;
  whiteMatterIntegrity: number;
  ventricularRatio: number;
  myelinationScore: number;
}

export type MRIRiskAmplification =
  | "NO_CHANGE"
  | "INCREASED"
  | "SIGNIFICANT_INCREASE"
  | "CRITICAL";

export interface MRIInferenceResult {
  volumeId: string;
  domainScores: MRIDomainScores;
  riskAmplification: MRIRiskAmplification;
  brainAgeEquivalent: number;
  keyFindings: string[];
  clinicalSummary: string;
  latencyMs: number;
  modelVersion: string;
  sequences: MRIScanType[];
}

export interface MRISeriesEntry {
  id: string;
  timestamp: number;
  modality: MRIScanType;
  sliceCount: number;
  patientAgeMonths: number;
  riskAmplification: MRIRiskAmplification;
  domainScores: MRIDomainScores;
  brainAgeEquivalent: number;
  latencyMs: number;
  keyFindings: string[];
}

export interface MRISliceData {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

export const MRI_SCAN_LABELS: Record<MRIScanType, string> = {
  T1_MPRAGE: "3D T1 MPRAGE",
  T2_SPACE: "3D T2 SPACE",
  DTI: "DTI White Matter",
  SWI: "SWI Susceptibility",
  CISS: "CISS Cisternography",
  FLAIR: "T2 FLAIR",
  ASL: "ASL Perfusion",
  fMRI: "Functional MRI",
};

export const MRI_RISK_COLORS: Record<MRIRiskAmplification, string> = {
  NO_CHANGE: "#34A853",
  INCREASED: "#F9AB00",
  SIGNIFICANT_INCREASE: "#EA4335",
  CRITICAL: "#B71C1C",
};

export const MRI_RISK_LABELS: Record<MRIRiskAmplification, string> = {
  NO_CHANGE: "No Change",
  INCREASED: "Increased",
  SIGNIFICANT_INCREASE: "Significant",
  CRITICAL: "Critical",
};

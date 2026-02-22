import type { RiskLevel } from "../data/types";

export interface VocalAnalysisInput {
  audioSamples: Float32Array;
  sampleRate: number;
  durationMs: number;
  childAgeMonths: number;
}

export interface CryClassification {
  type: "pain" | "hunger" | "fatigue" | "discomfort" | "colic" | "normal";
  confidence: number;
}

export interface VocalMilestone {
  milestone: string;
  achieved: boolean;
  confidence: number;
}

export interface VocalAnalysisResult {
  sessionId: string;
  cryClassification: CryClassification;
  vocalMilestones: VocalMilestone[];
  detectedLanguageFeatures: string[];
  babbleComplexity: number;
  overallVocalRisk: RiskLevel;
  confidence: number;
  inferenceTimeMs: number;
  parentSummary: string;
  clinicalNotes: string;
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface PoseEstimationInput {
  frameData: Uint8Array | null;
  width: number;
  height: number;
  childAgeMonths: number;
}

export interface MotorMilestone {
  milestone: string;
  probability: number;
  achieved: boolean;
}

export interface PoseEstimationResult {
  sessionId: string;
  keypoints: PoseKeypoint[];
  motorMilestones: MotorMilestone[];
  bimsScore: number;
  symmetryScore: number;
  overallMotorRisk: RiskLevel;
  confidence: number;
  inferenceTimeMs: number;
  parentSummary: string;
  clinicalNotes: string;
}

export interface FusionInput {
  screeningScore?: number;
  vocalScore?: number;
  motorScore?: number;
  childAgeMonths: number;
}

export interface FusionResult {
  overallRisk: RiskLevel;
  confidence: number;
  componentWeights: {
    screening: number;
    vocal: number;
    motor: number;
  };
  fusedScore: number;
  recommendation: string;
  inferenceTimeMs: number;
}

export const INFANT_KEYPOINTS = [
  "nose", "left_eye", "right_eye", "left_ear", "right_ear",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_hip", "right_hip",
  "left_knee", "right_knee", "left_ankle", "right_ankle",
];

export const INFANT_KEYPOINT_WEIGHTS: Record<string, number> = {
  nose: 0.8,
  left_shoulder: 0.9,
  right_shoulder: 0.9,
  left_hip: 1.0,
  right_hip: 1.0,
  left_knee: 0.6,
  right_knee: 0.6,
  left_wrist: 0.2,
  right_wrist: 0.2,
  left_eye: 0.4,
  right_eye: 0.4,
  left_ear: 0.3,
  right_ear: 0.3,
  left_elbow: 0.5,
  right_elbow: 0.5,
  left_ankle: 0.5,
  right_ankle: 0.5,
};

export function getMotorMilestonesForAge(ageMonths: number): string[] {
  if (ageMonths < 4) return ["Head lift", "Symmetrical limb movement", "Tummy time tolerance"];
  if (ageMonths < 7) return ["Rolling over", "Supported sitting", "Reaching for objects", "Head control"];
  if (ageMonths < 10) return ["Sitting unsupported", "Crawling attempts", "Object transfer hand-to-hand"];
  if (ageMonths < 13) return ["Pulling to stand", "Cruising furniture", "Pincer grasp"];
  if (ageMonths < 19) return ["Walking independently", "Stacking 2-3 blocks", "Scribbling with crayon"];
  if (ageMonths < 25) return ["Kicking a ball", "Walking upstairs with help", "Stacking 4+ blocks"];
  if (ageMonths < 37) return ["Running smoothly", "Jumping with both feet", "Drawing lines/circles"];
  return ["Hopping on one foot", "Catching a ball", "Drawing shapes", "Using scissors"];
}

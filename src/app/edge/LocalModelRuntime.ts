import { LocalInferenceResult, LocalSummaryResult, SummaryInput } from "./inferenceSchemas";
import type { VocalAnalysisInput, VocalAnalysisResult, PoseEstimationInput, PoseEstimationResult, FusionInput, FusionResult } from "./medgemmaSchemas";

export interface LocalModelRuntime {
  initialize(): Promise<void>;
  runRiskModel(features: Float32Array): Promise<LocalInferenceResult>;
  runSummaryModel(input: SummaryInput): Promise<LocalSummaryResult>;
  getModelInfo(): { modelId: string; version: string };

  runVocalAnalysis?(input: VocalAnalysisInput): Promise<VocalAnalysisResult>;
  runPoseEstimation?(input: PoseEstimationInput): Promise<PoseEstimationResult>;
  runFusion?(input: FusionInput): Promise<FusionResult>;
  getCapabilities(): MedGemmaRuntimeCapabilities;
}

export interface MedGemmaRuntimeCapabilities {
  screening: boolean;
  vocal: boolean;
  pose: boolean;
  fusion: boolean;
}

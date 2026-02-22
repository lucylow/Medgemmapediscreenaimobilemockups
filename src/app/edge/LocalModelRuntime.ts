import { LocalInferenceResult, LocalSummaryResult, SummaryInput } from "./inferenceSchemas";

export interface LocalModelRuntime {
  initialize(): Promise<void>;
  runRiskModel(features: Float32Array): Promise<LocalInferenceResult>;
  runSummaryModel(input: SummaryInput): Promise<LocalSummaryResult>;
  getModelInfo(): { modelId: string; version: string };
}

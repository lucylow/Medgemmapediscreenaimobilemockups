import { ScreeningSession } from "../data/types";
import { LocalInferenceResult, LocalSummaryResult, ModelProvenance } from "./inferenceSchemas";
import { encodeFeaturesForModel, featuresToFloat32Array } from "./featureEncoding";
import { LocalModelRuntime, MedGemmaRuntimeCapabilities } from "./LocalModelRuntime";
import type { VocalAnalysisInput, VocalAnalysisResult, PoseEstimationInput, PoseEstimationResult, FusionInput, FusionResult, XrayAnalysisInput, XrayAnalysisResult } from "./medgemmaSchemas";
import type { CTAnalysisInput, CTAnalysisResult } from "../ct/ctSchemas";

export class EdgeAiEngine {
  private runtime: LocalModelRuntime;
  private _ready = false;
  private _warmupTimeMs = 0;
  private _lastInferenceTimeMs = 0;
  private _lastSummaryTimeMs = 0;
  private _inferenceCount = 0;
  private _vocalCount = 0;
  private _poseCount = 0;
  private _fusionCount = 0;
  private _xrayCount = 0;
  private _ctCount = 0;

  constructor(runtime: LocalModelRuntime) {
    this.runtime = runtime;
  }

  async warmup(): Promise<void> {
    const start = performance.now();
    await this.runtime.initialize();
    this._warmupTimeMs = performance.now() - start;
    this._ready = true;
  }

  isReady(): boolean {
    return this._ready;
  }

  get warmupTimeMs(): number {
    return this._warmupTimeMs;
  }

  get lastInferenceTimeMs(): number {
    return this._lastInferenceTimeMs;
  }

  get lastSummaryTimeMs(): number {
    return this._lastSummaryTimeMs;
  }

  get inferenceCount(): number {
    return this._inferenceCount;
  }

  get vocalCount(): number {
    return this._vocalCount;
  }

  get poseCount(): number {
    return this._poseCount;
  }

  get fusionCount(): number {
    return this._fusionCount;
  }

  get xrayCount(): number {
    return this._xrayCount;
  }

  get ctCount(): number {
    return this._ctCount;
  }

  get totalInferenceCount(): number {
    return this._inferenceCount + this._vocalCount + this._poseCount + this._fusionCount + this._xrayCount + this._ctCount;
  }

  getCapabilities(): MedGemmaRuntimeCapabilities {
    return this.runtime.getCapabilities();
  }

  getModelProvenance(mode: "mock" | "local-model" = "mock"): ModelProvenance {
    const info = this.runtime.getModelInfo();
    return { ...info, runtime: mode };
  }

  async runScreeningInference(session: ScreeningSession): Promise<LocalInferenceResult> {
    if (!this._ready) {
      await this.warmup();
    }

    const features = encodeFeaturesForModel(session);
    const featureArray = featuresToFloat32Array(features);

    const start = performance.now();
    const inference = await this.runtime.runRiskModel(featureArray);
    this._lastInferenceTimeMs = performance.now() - start;
    this._inferenceCount++;

    inference.sessionId = session.id;
    return inference;
  }

  async generateSummaries(
    session: ScreeningSession,
    inference: LocalInferenceResult
  ): Promise<LocalSummaryResult> {
    const start = performance.now();
    const summary = await this.runtime.runSummaryModel({
      sessionId: session.id,
      ageMonths: session.ageMonths,
      inference,
      parentConcerns: session.parentConcernsText,
    });
    this._lastSummaryTimeMs = performance.now() - start;
    return summary;
  }

  async runVocalAnalysis(input: VocalAnalysisInput): Promise<VocalAnalysisResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runVocalAnalysis) return null;

    const result = await this.runtime.runVocalAnalysis(input);
    this._vocalCount++;
    return result;
  }

  async runPoseEstimation(input: PoseEstimationInput): Promise<PoseEstimationResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runPoseEstimation) return null;

    const result = await this.runtime.runPoseEstimation(input);
    this._poseCount++;
    return result;
  }

  async runFusion(input: FusionInput): Promise<FusionResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runFusion) return null;

    const result = await this.runtime.runFusion(input);
    this._fusionCount++;
    return result;
  }

  async runXrayAnalysis(input: XrayAnalysisInput): Promise<XrayAnalysisResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runXrayAnalysis) return null;

    const result = await this.runtime.runXrayAnalysis(input);
    this._xrayCount++;
    return result;
  }

  async runCTAnalysis(input: CTAnalysisInput): Promise<CTAnalysisResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runCTAnalysis) return null;

    const result = await this.runtime.runCTAnalysis(input);
    this._ctCount++;
    return result;
  }
}

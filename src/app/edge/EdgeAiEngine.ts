import { ScreeningSession } from "../data/types";
import { LocalInferenceResult, LocalSummaryResult, ModelProvenance } from "./inferenceSchemas";
import { encodeFeaturesForModel, featuresToFloat32Array } from "./featureEncoding";
import { LocalModelRuntime } from "./LocalModelRuntime";

export class EdgeAiEngine {
  private runtime: LocalModelRuntime;
  private _ready = false;
  private _warmupTimeMs = 0;
  private _lastInferenceTimeMs = 0;
  private _lastSummaryTimeMs = 0;
  private _inferenceCount = 0;

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
}

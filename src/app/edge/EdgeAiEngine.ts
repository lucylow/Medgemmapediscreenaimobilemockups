import { ScreeningSession } from "../data/types";
import { LocalInferenceResult, LocalSummaryResult, ModelProvenance } from "./inferenceSchemas";
import { encodeFeaturesForModel, featuresToFloat32Array } from "./featureEncoding";
import { LocalModelRuntime, MedGemmaRuntimeCapabilities } from "./LocalModelRuntime";
import type { VocalAnalysisInput, VocalAnalysisResult, PoseEstimationInput, PoseEstimationResult, FusionInput, FusionResult, XrayAnalysisInput, XrayAnalysisResult } from "./medgemmaSchemas";
import type { CTAnalysisInput, CTAnalysisResult } from "../ct/ctSchemas";
import type { MRIAnalysisInput, MRIAnalysisResult } from "../mri/mriSchemas";

interface CacheEntry<T> {
  result: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

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
  private _mriCount = 0;
  private _cacheHits = 0;
  private _cacheMisses = 0;

  private _inferenceCache = new Map<string, CacheEntry<LocalInferenceResult>>();

  constructor(runtime: LocalModelRuntime) {
    this.runtime = runtime;
  }

  private _buildCacheKey(session: ScreeningSession): string {
    const domainAnswers = session.domains
      .map((d) => `${d.domain}:${d.questions.map((q) => q.answer ?? "null").join(",")}`)
      .join("|");
    return `${session.ageMonths}-${domainAnswers}-${session.parentConcernsText.substring(0, 80)}-${session.media.length}`;
  }

  private _evictStaleCache(): void {
    const now = Date.now();
    for (const [key, entry] of this._inferenceCache) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        this._inferenceCache.delete(key);
      }
    }
    if (this._inferenceCache.size > MAX_CACHE_SIZE) {
      const oldest = [...this._inferenceCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = oldest.slice(0, this._inferenceCache.size - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this._inferenceCache.delete(key));
    }
  }

  get cacheHits(): number { return this._cacheHits; }
  get cacheMisses(): number { return this._cacheMisses; }
  get cacheSize(): number { return this._inferenceCache.size; }

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

  get mriCount(): number {
    return this._mriCount;
  }

  get totalInferenceCount(): number {
    return this._inferenceCount + this._vocalCount + this._poseCount + this._fusionCount + this._xrayCount + this._ctCount + this._mriCount;
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

    this._evictStaleCache();
    const cacheKey = this._buildCacheKey(session);
    const cached = this._inferenceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      this._cacheHits++;
      const result = { ...cached.result, sessionId: session.id };
      this._lastInferenceTimeMs = 0;
      return result;
    }

    if ("setObservationContext" in this.runtime && typeof (this.runtime as any).setObservationContext === "function") {
      (this.runtime as any).setObservationContext(session.parentConcernsText, session.ageMonths);
    }

    const features = encodeFeaturesForModel(session);
    const featureArray = featuresToFloat32Array(features);

    const start = performance.now();
    const inference = await this.runtime.runRiskModel(featureArray);
    this._lastInferenceTimeMs = performance.now() - start;
    this._inferenceCount++;
    this._cacheMisses++;

    inference.sessionId = session.id;
    this._inferenceCache.set(cacheKey, { result: inference, timestamp: Date.now() });
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

  async runMRIAnalysis(input: MRIAnalysisInput): Promise<MRIAnalysisResult | null> {
    if (!this._ready) await this.warmup();
    if (!this.runtime.runMRIAnalysis) return null;

    const result = await this.runtime.runMRIAnalysis(input);
    this._mriCount++;
    return result;
  }
}

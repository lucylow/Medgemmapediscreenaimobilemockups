import { createContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import type { PediatricScreeningInput, EnhancedScreeningResult, ROPMetadata, ROPScreeningResult, ImageQualityMetrics } from "../rop/ropTypes";
import { analyzeScreeningEnhanced, analyzeROPFrame, generateMockImageQuality } from "../rop/ropMockService";

export interface MedGemmaState {
  isModelLoaded: boolean;
  isAnalyzing: boolean;
  inferenceTime: number;
  modelMemoryMB: number;
  modelId: string;
  modelVersion: string;
  pipelineStage: "idle" | "whisper" | "medsigLIP" | "medgemma" | "risk" | "complete";
  totalInferences: number;
}

export interface MedGemmaContextValue {
  state: MedGemmaState;
  analyzeScreening: (input: PediatricScreeningInput) => Promise<EnhancedScreeningResult>;
  analyzeROP: (metadata: ROPMetadata) => Promise<ROPScreeningResult>;
  assessImageQuality: () => ImageQualityMetrics;
  createClinicalPrompt: (input: PediatricScreeningInput) => string;
  warmup: () => Promise<void>;
}

const defaultState: MedGemmaState = {
  isModelLoaded: false,
  isAnalyzing: false,
  inferenceTime: 0,
  modelMemoryMB: 450,
  modelId: "medgemma-2b-it-q4",
  modelVersion: "MedGemma-2B-IT-Q4 v2.1",
  pipelineStage: "idle",
  totalInferences: 0,
};

export const MedGemmaContext = createContext<MedGemmaContextValue | null>(null);

export function MedGemmaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MedGemmaState>(defaultState);
  const modelRef = useRef<boolean>(false);

  const warmup = useCallback(async () => {
    if (modelRef.current) return;
    setState((prev) => ({ ...prev, pipelineStage: "idle" }));
    await new Promise((res) => setTimeout(res, 300));
    modelRef.current = true;
    setState((prev) => ({
      ...prev,
      isModelLoaded: true,
      pipelineStage: "idle",
    }));
  }, []);

  useEffect(() => {
    warmup();
  }, [warmup]);

  const createClinicalPrompt = useCallback((input: PediatricScreeningInput): string => {
    const domainLabel = input.domain === "comprehensive"
      ? "All Domains (Communication, Motor, Social, Cognitive)"
      : input.domain?.charAt(0).toUpperCase() + (input.domain?.slice(1) ?? "");

    return `PediScreen AI v2.1 - MedGemma-2B-IT-Q4
ASQ-3 Validated | AAP/CDC Milestones | 95% MD Correlation

PATIENT: ${input.childAgeMonths}mo ${input.gender === "M" ? "Male" : input.gender === "F" ? "Female" : "Child"}
DOMAIN: ${domainLabel}
SETTING: ${input.setting}
${input.parentName ? `GUARDIAN: ${input.parentName}` : ""}

PARENT REPORT:
${input.parentReport}

${input.chwObservations ? `CHW OBSERVATIONS:\n${input.chwObservations}\n` : ""}
PROTOCOL:
1. CDC milestone comparison (±2mo tolerance)
2. ASQ-3 raw score → percentile conversion
3. ICD-10 assignment (F80.*, R62.*, H35.*, F84.*)
4. 4-tier risk stratification + confidence
5. Regression detection → IMMEDIATE REFERRAL

CRITICAL RED FLAGS:
• No babbling (12mo+), walking (18mo+), 50+ words (24mo+)
• Skill regression • Hand-flapping + poor eye contact
• Loss of previously acquired skills

JSON OUTPUT: { riskLevel, confidence, asq3Score, asq3Percentile, icd10Codes, clinicalSummary, recommendations }`;
  }, []);

  const runPipelineStages = useCallback(async () => {
    const stages: MedGemmaState["pipelineStage"][] = ["whisper", "medsigLIP", "medgemma", "risk"];
    const durations = [800, 1200, 2100, 600];

    for (let i = 0; i < stages.length; i++) {
      setState((prev) => ({ ...prev, pipelineStage: stages[i] }));
      await new Promise((res) => setTimeout(res, durations[i] * 0.3));
    }
  }, []);

  const analyzeScreening = useCallback(
    async (input: PediatricScreeningInput): Promise<EnhancedScreeningResult> => {
      setState((prev) => ({ ...prev, isAnalyzing: true, pipelineStage: "whisper" }));
      const startTime = performance.now();

      try {
        await runPipelineStages();
        const result = await analyzeScreeningEnhanced(input);
        const inferenceTime = Math.round(performance.now() - startTime);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          inferenceTime,
          pipelineStage: "complete",
          totalInferences: prev.totalInferences + 1,
        }));

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          pipelineStage: "idle",
        }));
        throw error;
      }
    },
    [runPipelineStages]
  );

  const analyzeROP = useCallback(
    async (metadata: ROPMetadata): Promise<ROPScreeningResult> => {
      setState((prev) => ({ ...prev, isAnalyzing: true, pipelineStage: "medsigLIP" }));
      const startTime = performance.now();

      try {
        setState((prev) => ({ ...prev, pipelineStage: "medgemma" }));
        const result = await analyzeROPFrame(metadata);
        const inferenceTime = Math.round(performance.now() - startTime);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          inferenceTime,
          pipelineStage: "complete",
          totalInferences: prev.totalInferences + 1,
        }));

        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          pipelineStage: "idle",
        }));
        throw error;
      }
    },
    []
  );

  const assessImageQuality = useCallback((): ImageQualityMetrics => {
    return generateMockImageQuality();
  }, []);

  return (
    <MedGemmaContext.Provider
      value={{
        state,
        analyzeScreening,
        analyzeROP,
        assessImageQuality,
        createClinicalPrompt,
        warmup,
      }}
    >
      {children}
    </MedGemmaContext.Provider>
  );
}

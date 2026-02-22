import type { CTVolumeMeta, CTInferenceResult, CTDomainScores, CTRiskTier, CTUseCaseFlag } from "./ctTypes";

export interface CTAnalysisInput {
  volumeMeta: CTVolumeMeta;
  patchData: Float32Array[];
  childAgeMonths?: number;
}

export interface CTAnalysisResult extends CTInferenceResult {}

export function inferCTRiskTier(scores: CTDomainScores): CTRiskTier {
  const maxScore = Math.max(
    scores.hemorrhageRisk,
    scores.fractureRisk,
    scores.necRisk,
    scores.tumorBurden
  );
  if (maxScore < 0.25) return "ON_TRACK";
  if (maxScore < 0.5) return "MONITOR";
  if (maxScore < 0.75) return "REFER";
  return "CRITICAL";
}

export function generateCTKeyFindings(
  modality: CTVolumeMeta["modality"],
  scores: CTDomainScores,
  tier: CTRiskTier
): string[] {
  const findings: string[] = [];

  if (scores.hemorrhageRisk > 0.6 && (modality === "CT_HEAD")) {
    findings.push("Increased intracranial hemorrhage risk detected; correlate with IVH grading scale.");
  }
  if (scores.fractureRisk > 0.6) {
    findings.push("High probability of cortical disruption; pediatric orthopedic review recommended.");
  }
  if (scores.necRisk > 0.6 && (modality === "CT_ABDOMEN")) {
    findings.push("Pattern suspicious for NEC; assess bowel wall thickening and portal venous gas.");
  }
  if (scores.tumorBurden > 0.6) {
    findings.push("Possible solid mass or lymphadenopathy; consider oncology staging CT with contrast.");
  }

  if (scores.hemorrhageRisk > 0.4 && scores.hemorrhageRisk <= 0.6 && modality === "CT_HEAD") {
    findings.push("Mild periventricular changes noted; recommend follow-up cranial imaging.");
  }
  if (scores.necRisk > 0.4 && scores.necRisk <= 0.6 && modality === "CT_ABDOMEN") {
    findings.push("Borderline bowel wall changes; clinical correlation with feeding tolerance advised.");
  }

  if (findings.length === 0) {
    findings.push("No high-risk CT features detected; routine follow-up as clinically indicated.");
  }

  return findings;
}

export function generateCTUseCaseFlags(
  modality: CTVolumeMeta["modality"],
  scores: CTDomainScores
): CTUseCaseFlag[] {
  return [
    {
      useCase: "Preemie IVH",
      code: "P52.9",
      probability: modality === "CT_HEAD" ? scores.hemorrhageRisk : scores.hemorrhageRisk * 0.3,
      triggered: modality === "CT_HEAD" && scores.hemorrhageRisk > 0.5,
    },
    {
      useCase: "Pediatric Fracture",
      code: "S02.9",
      probability: scores.fractureRisk,
      triggered: scores.fractureRisk > 0.5,
    },
    {
      useCase: "NEC / Appendicitis",
      code: "P77.9",
      probability: modality === "CT_ABDOMEN" ? scores.necRisk : scores.necRisk * 0.2,
      triggered: modality === "CT_ABDOMEN" && scores.necRisk > 0.5,
    },
    {
      useCase: "Oncology Staging",
      code: "C80.1",
      probability: scores.tumorBurden,
      triggered: scores.tumorBurden > 0.5,
    },
  ];
}

export function generateCTClinicalSummary(
  modality: CTVolumeMeta["modality"],
  scores: CTDomainScores,
  tier: CTRiskTier,
  sliceCount: number
): string {
  return (
    `Automated CT analysis (${modality}, ${sliceCount} slices) ` +
    `suggests overall ${tier} risk. ` +
    `Hemorrhage: ${(scores.hemorrhageRisk * 100).toFixed(0)}%, ` +
    `Fracture: ${(scores.fractureRisk * 100).toFixed(0)}%, ` +
    `NEC: ${(scores.necRisk * 100).toFixed(0)}%, ` +
    `Tumor burden: ${(scores.tumorBurden * 100).toFixed(0)}%. ` +
    `This is AI-generated decision support only; requires pediatric radiologist review.`
  );
}

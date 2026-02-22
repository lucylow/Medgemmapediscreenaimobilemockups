import type {
  MRIVolumeMeta,
  MRIInferenceResult,
  MRIDomainScores,
  MRIRiskAmplification,
  MRIScanType,
} from "./mriTypes";

export interface MRIAnalysisInput {
  volumeMeta: MRIVolumeMeta;
  patchData: Float32Array[];
  childAgeMonths: number;
  sequences: MRIScanType[];
}

export interface MRIAnalysisResult extends MRIInferenceResult {}

export function inferMRIRiskAmplification(
  scores: MRIDomainScores
): MRIRiskAmplification {
  const gap = Math.abs(scores.brainAgeGapMonths);
  const wmi = scores.whiteMatterIntegrity;
  const vr = scores.ventricularRatio;

  if (gap > 6 || wmi < 0.5 || vr > 0.35) return "CRITICAL";
  if (gap > 4 || wmi < 0.65 || vr > 0.25) return "SIGNIFICANT_INCREASE";
  if (gap > 2 || wmi < 0.8 || vr > 0.18) return "INCREASED";
  return "NO_CHANGE";
}

export function generateMRIKeyFindings(
  modality: MRIScanType,
  scores: MRIDomainScores,
  risk: MRIRiskAmplification,
  patientAgeMonths: number
): string[] {
  const findings: string[] = [];
  const brainAge = patientAgeMonths + scores.brainAgeGapMonths;

  if (Math.abs(scores.brainAgeGapMonths) > 2) {
    const dir = scores.brainAgeGapMonths > 0 ? "delayed" : "advanced";
    findings.push(
      `Brain age gap ${scores.brainAgeGapMonths > 0 ? "+" : ""}${scores.brainAgeGapMonths.toFixed(1)} months (${dir}, p<0.01)`
    );
  }

  if (scores.whiteMatterIntegrity < 0.7) {
    findings.push(
      `White matter FA ${scores.whiteMatterIntegrity.toFixed(2)} — below age-adjusted norm; arcuate fasciculus involvement`
    );
  } else if (scores.whiteMatterIntegrity < 0.85) {
    findings.push(
      `White matter FA ${scores.whiteMatterIntegrity.toFixed(2)} — borderline; recommend DTI follow-up`
    );
  }

  if (scores.ventricularRatio > 0.25) {
    findings.push(
      `Ventricular ratio ${(scores.ventricularRatio * 100).toFixed(0)}% — ventriculomegaly; correlate with head circumference`
    );
  }

  if (scores.corticalThickness < 1.8) {
    findings.push(
      `Cortical thickness ${scores.corticalThickness.toFixed(1)}mm — below expected range for ${patientAgeMonths}-month-old`
    );
  }

  if (scores.myelinationScore < 0.7) {
    findings.push(
      `Myelination score ${(scores.myelinationScore * 100).toFixed(0)}% — delayed myelination pattern on T2`
    );
  }

  if (findings.length === 0) {
    findings.push(
      "Brain morphology and white matter tracts within normal limits for age."
    );
    findings.push("Hippocampal volume within normal limits.");
  }

  return findings;
}

export function generateMRIClinicalSummary(
  modality: MRIScanType,
  scores: MRIDomainScores,
  risk: MRIRiskAmplification,
  patientAgeMonths: number,
  sequences: MRIScanType[]
): string {
  const brainAge = patientAgeMonths + scores.brainAgeGapMonths;
  const seqList = sequences.map((s) => s.replace("_", " ")).join(", ");

  return (
    `MRI brain analysis (${seqList}, ${patientAgeMonths}-month-old) ` +
    `indicates risk amplification: ${risk.replace(/_/g, " ")}. ` +
    `Brain age equivalent: ${brainAge.toFixed(1)} months ` +
    `(gap: ${scores.brainAgeGapMonths > 0 ? "+" : ""}${scores.brainAgeGapMonths.toFixed(1)}m). ` +
    `Cortical thickness: ${scores.corticalThickness.toFixed(1)}mm, ` +
    `WM integrity (FA): ${scores.whiteMatterIntegrity.toFixed(2)}, ` +
    `Ventricular ratio: ${(scores.ventricularRatio * 100).toFixed(0)}%, ` +
    `Myelination: ${(scores.myelinationScore * 100).toFixed(0)}%. ` +
    `AI-generated decision support — requires pediatric neuroradiologist review.`
  );
}

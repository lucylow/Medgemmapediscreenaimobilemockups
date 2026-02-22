import { LocalModelRuntime, MedGemmaRuntimeCapabilities } from "./LocalModelRuntime";
import {
  LocalInferenceResult,
  LocalSummaryResult,
  SummaryInput,
  EdgeDomainRisk,
} from "./inferenceSchemas";
import { DomainType, RiskLevel, DOMAIN_LABELS } from "../data/types";
import type {
  VocalAnalysisInput,
  VocalAnalysisResult,
  VocalMilestone,
  CryClassification,
  PoseEstimationInput,
  PoseEstimationResult,
  PoseKeypoint,
  MotorMilestone,
  FusionInput,
  FusionResult,
  XrayAnalysisInput,
  XrayAnalysisResult,
  XrayLandmark,
} from "./medgemmaSchemas";
import { INFANT_KEYPOINTS, getMotorMilestonesForAge } from "./medgemmaSchemas";
import type { CTAnalysisInput, CTAnalysisResult } from "../ct/ctSchemas";
import {
  inferCTRiskTier,
  generateCTKeyFindings,
  generateCTUseCaseFlags,
  generateCTClinicalSummary,
} from "../ct/ctSchemas";

function scoreToRisk(score: number): RiskLevel {
  if (score >= 0.75) return "on_track";
  if (score >= 0.5) return "monitor";
  if (score >= 0.3) return "discuss";
  return "refer";
}

export class MockRuntime implements LocalModelRuntime {
  private initTime = 0;

  async initialize(): Promise<void> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 300));
    this.initTime = performance.now() - start;
  }

  getModelInfo() {
    return { modelId: "medgemma-pediscreen-2b", version: "1.0.0-q4" };
  }

  getCapabilities(): MedGemmaRuntimeCapabilities {
    return { screening: true, vocal: true, pose: true, fusion: true, xray: true, ct: true };
  }

  async runRiskModel(features: Float32Array): Promise<LocalInferenceResult> {
    await new Promise((res) => setTimeout(res, 400 + Math.random() * 200));

    const domains: DomainType[] = ["communication", "gross_motor", "fine_motor", "social", "cognitive"];

    const domainRisks: EdgeDomainRisk[] = domains.map((domain, i) => {
      const rawScore = features[i + 1];
      const jitter = (Math.random() - 0.5) * 0.1;
      const score = Math.max(0, Math.min(1, rawScore + jitter));
      return { domain, risk: scoreToRisk(score), score };
    });

    const overallScore = domainRisks.reduce((s, d) => s + d.score, 0) / domainRisks.length;
    const overallRisk = scoreToRisk(overallScore);

    const strengths = domainRisks
      .filter((d) => d.risk === "on_track")
      .map((d) => `${DOMAIN_LABELS[d.domain]} skills appear on track`);

    const watchAreas = domainRisks
      .filter((d) => d.risk !== "on_track")
      .map((d) => DOMAIN_LABELS[d.domain]);

    const keyFindings = domainRisks
      .filter((d) => d.risk === "monitor" || d.risk === "discuss" || d.risk === "refer")
      .map((d) => `${DOMAIN_LABELS[d.domain]} may benefit from additional support`);

    return {
      sessionId: "edge_session",
      overallRisk,
      overallScore,
      domainRisks,
      keyFindings,
      strengths,
      watchAreas,
    };
  }

  async runSummaryModel({ sessionId, ageMonths, inference, parentConcerns }: SummaryInput): Promise<LocalSummaryResult> {
    await new Promise((res) => setTimeout(res, 300 + Math.random() * 200));

    const onTrack = inference.domainRisks.filter((d) => d.risk === "on_track");
    const concerns = inference.domainRisks.filter((d) => d.risk !== "on_track");

    let parentSummary: string;
    if (concerns.length === 0) {
      parentSummary = `This screening suggests your ${ageMonths}-month-old is developing well across all areas assessed. Keep up the great work with your child's learning and play activities!`;
    } else {
      const concernNames = concerns.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(" and ");
      const strengthNames = onTrack.map((d) => DOMAIN_LABELS[d.domain].toLowerCase()).join(", ");
      parentSummary = `This screening suggests your child is doing well in ${strengthNames || "several areas"}. The area(s) of ${concernNames} may benefit from extra attention. This does not mean anything is wrong — many children catch up with a little extra support. Consider discussing these results with your child's health provider.`;
    }

    const domainLines = inference.domainRisks.map(
      (d) => `${DOMAIN_LABELS[d.domain]}: ${(d.score * 100).toFixed(0)}% — ${d.risk.toUpperCase()}`
    );
    const clinicianSummary = `Edge AI screening for ${ageMonths}-month-old child.\n${domainLines.join("\n")}\nOverall: ${inference.overallRisk.toUpperCase()} (${(inference.overallScore * 100).toFixed(0)}%)\nNote: AI-generated draft. Clinician review required.`;

    const nextSteps: string[] = [];
    if (concerns.length > 0) {
      nextSteps.push("Share this summary with your child's doctor, nurse, or health worker.");
      concerns.forEach((d) => {
        nextSteps.push(`Try activities at home that support ${DOMAIN_LABELS[d.domain].toLowerCase()} development.`);
      });
    }
    nextSteps.push("Repeat this screening in 3\u20136 months or sooner if you have concerns.");
    nextSteps.push("Remember: this screening does not replace professional medical advice.");

    return { parentSummary, clinicianSummary, nextSteps };
  }

  async runVocalAnalysis(input: VocalAnalysisInput): Promise<VocalAnalysisResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 300 + Math.random() * 200));

    const cryTypes: CryClassification["type"][] = ["pain", "hunger", "fatigue", "discomfort", "colic", "normal"];
    const selectedType = cryTypes[Math.floor(Math.random() * cryTypes.length)];
    const cryClassification: CryClassification = {
      type: selectedType,
      confidence: 0.82 + Math.random() * 0.13,
    };

    const ageBasedMilestones = this.getVocalMilestonesForAge(input.childAgeMonths);
    const vocalMilestones: VocalMilestone[] = ageBasedMilestones.map((ms) => ({
      milestone: ms,
      achieved: Math.random() > 0.35,
      confidence: 0.7 + Math.random() * 0.25,
    }));

    const achievedCount = vocalMilestones.filter((m) => m.achieved).length;
    const achievedPct = vocalMilestones.length > 0 ? achievedCount / vocalMilestones.length : 1;

    const babbleComplexity = 0.3 + Math.random() * 0.6;
    const overallVocalRisk = scoreToRisk(achievedPct);

    const detectedLanguageFeatures: string[] = [];
    if (input.childAgeMonths >= 6) detectedLanguageFeatures.push("Consonant-vowel combinations");
    if (input.childAgeMonths >= 10) detectedLanguageFeatures.push("Canonical babbling patterns");
    if (input.childAgeMonths >= 14) detectedLanguageFeatures.push("Prosodic variation detected");
    if (babbleComplexity > 0.6) detectedLanguageFeatures.push("Complex syllable chains");

    const parentSummary = overallVocalRisk === "on_track"
      ? `Your ${input.childAgeMonths}-month-old shows healthy vocal development. Their sounds and babbling patterns are age-appropriate. Keep talking, singing, and reading together!`
      : `Your ${input.childAgeMonths}-month-old's vocal patterns suggest some areas that may benefit from extra attention. Try talking and reading more with your child. Consider discussing with your health provider at the next visit.`;

    const clinicalNotes = `Vocal analysis for ${input.childAgeMonths}-month-old.\nCry classification: ${selectedType} (${(cryClassification.confidence * 100).toFixed(0)}%)\nBabble complexity: ${(babbleComplexity * 100).toFixed(0)}%\nMilestones: ${achievedCount}/${vocalMilestones.length} achieved\nOverall: ${overallVocalRisk.toUpperCase()}\nModel: medgemma-vocal-lora v1.0.0-q4`;

    return {
      sessionId: `vocal_${Date.now()}`,
      cryClassification,
      vocalMilestones,
      detectedLanguageFeatures,
      babbleComplexity,
      overallVocalRisk,
      confidence: 0.85 + Math.random() * 0.1,
      inferenceTimeMs: Math.round(performance.now() - start),
      parentSummary,
      clinicalNotes,
    };
  }

  async runPoseEstimation(input: PoseEstimationInput): Promise<PoseEstimationResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 40 + Math.random() * 30));

    const keypoints: PoseKeypoint[] = INFANT_KEYPOINTS.map((name) => ({
      name,
      x: 0.2 + Math.random() * 0.6,
      y: 0.1 + Math.random() * 0.7,
      confidence: 0.5 + Math.random() * 0.45,
    }));

    const milestoneNames = getMotorMilestonesForAge(input.childAgeMonths);
    const motorMilestones: MotorMilestone[] = milestoneNames.map((ms) => {
      const prob = 0.3 + Math.random() * 0.6;
      return { milestone: ms, probability: prob, achieved: prob > 0.55 };
    });

    const achievedCount = motorMilestones.filter((m) => m.achieved).length;
    const achievedPct = motorMilestones.length > 0 ? achievedCount / motorMilestones.length : 1;
    const bimsScore = Math.round(achievedPct * 100);

    const leftShoulder = keypoints.find((k) => k.name === "left_shoulder");
    const rightShoulder = keypoints.find((k) => k.name === "right_shoulder");
    const leftHip = keypoints.find((k) => k.name === "left_hip");
    const rightHip = keypoints.find((k) => k.name === "right_hip");
    const symmetryScore = leftShoulder && rightShoulder && leftHip && rightHip
      ? 1 - Math.abs((leftShoulder.y - rightShoulder.y) + (leftHip.y - rightHip.y)) / 2
      : 0.85;

    const overallMotorRisk = scoreToRisk(achievedPct);

    const parentSummary = overallMotorRisk === "on_track"
      ? `Your ${input.childAgeMonths}-month-old shows good motor development! Their movements and posture look age-appropriate. Keep providing safe spaces for active play.`
      : `Your ${input.childAgeMonths}-month-old's motor patterns suggest some areas that may benefit from more practice. Try tummy time, reaching games, and supervised movement activities. Consider discussing with your health provider.`;

    const clinicalNotes = `Pose estimation for ${input.childAgeMonths}-month-old.\nBIMS Score: ${bimsScore}/100\nSymmetry: ${(symmetryScore * 100).toFixed(0)}%\nMilestones: ${achievedCount}/${motorMilestones.length}\nKeypoint confidence: ${(keypoints.reduce((s, k) => s + k.confidence, 0) / keypoints.length * 100).toFixed(0)}%\nOverall: ${overallMotorRisk.toUpperCase()}\nModel: medgemma-movenet-infant v1.0.0`;

    return {
      sessionId: `pose_${Date.now()}`,
      keypoints,
      motorMilestones,
      bimsScore,
      symmetryScore: Math.max(0, Math.min(1, symmetryScore)),
      overallMotorRisk,
      confidence: 0.82 + Math.random() * 0.12,
      inferenceTimeMs: Math.round(performance.now() - start),
      parentSummary,
      clinicalNotes,
    };
  }

  async runFusion(input: FusionInput): Promise<FusionResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 150));

    const weights = { screening: 0.5, vocal: 0.25, motor: 0.25 };
    const screeningScore = input.screeningScore ?? 0.7;
    const vocalScore = input.vocalScore ?? 0.7;
    const motorScore = input.motorScore ?? 0.7;

    const fusedScore =
      screeningScore * weights.screening +
      vocalScore * weights.vocal +
      motorScore * weights.motor;

    const overallRisk = scoreToRisk(fusedScore);

    const recommendations: Record<RiskLevel, string> = {
      on_track: "Multi-modal assessment indicates development is progressing well across all evaluated channels (screening, vocal, motor).",
      monitor: "Fusion analysis suggests monitoring may be beneficial. Individual channels show some variation worth tracking over time.",
      discuss: "Combined signals from screening, vocal, and motor assessment suggest discussing developmental concerns with a healthcare provider.",
      refer: "Multi-modal fusion indicates elevated concern across multiple channels. Professional developmental evaluation is recommended.",
    };

    return {
      overallRisk,
      confidence: 0.88 + Math.random() * 0.08,
      componentWeights: weights,
      fusedScore,
      recommendation: recommendations[overallRisk],
      inferenceTimeMs: Math.round(performance.now() - start),
    };
  }

  async runXrayAnalysis(input: XrayAnalysisInput): Promise<XrayAnalysisResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 300));

    const chronoAge = input.childAgeMonths;
    const boneAgeOffset = (Math.random() - 0.5) * 8;
    const boneAgeMonths = Math.max(1, chronoAge + boneAgeOffset);
    const boneAgeZScore = (boneAgeMonths - chronoAge) / 4;

    const zAbs = Math.abs(boneAgeZScore);
    const percentile = boneAgeZScore >= 0
      ? Math.min(99, Math.round(50 + (boneAgeZScore / 3) * 49))
      : Math.max(1, Math.round(50 + (boneAgeZScore / 3) * 49));

    const skeletalMaturity: XrayAnalysisResult["skeletalMaturity"] =
      boneAgeZScore < -1.5 ? "delayed" : boneAgeZScore > 1.5 ? "advanced" : "normal";

    const fractureRisk: XrayAnalysisResult["fractureRisk"] =
      zAbs > 2.5 ? "high" : zAbs > 1.5 ? "moderate" : zAbs > 0.8 ? "low" : "none";

    const growthVelocityCmYear = chronoAge < 12 ? 20 + Math.random() * 5
      : chronoAge < 36 ? 8 + Math.random() * 4
      : 5 + Math.random() * 3;

    const ossificationStates: XrayLandmark["ossification"][] = ["none", "partial", "complete"];
    const keyLandmarks: XrayLandmark[] = [
      { name: "Distal Radius", present: chronoAge > 6, ossification: chronoAge > 36 ? "complete" : chronoAge > 12 ? "partial" : "none", confidence: 0.85 + Math.random() * 0.1 },
      { name: "Proximal Phalanx", present: chronoAge > 3, ossification: chronoAge > 24 ? "complete" : chronoAge > 8 ? "partial" : "none", confidence: 0.88 + Math.random() * 0.08 },
      { name: "Metacarpals (5)", present: true, ossification: chronoAge > 48 ? "complete" : chronoAge > 18 ? "partial" : "none", confidence: 0.9 + Math.random() * 0.06 },
      { name: "Capitate", present: chronoAge > 2, ossification: chronoAge > 30 ? "complete" : chronoAge > 6 ? "partial" : "none", confidence: 0.82 + Math.random() * 0.12 },
      { name: "Hamate", present: chronoAge > 3, ossification: chronoAge > 36 ? "complete" : chronoAge > 8 ? "partial" : "none", confidence: 0.8 + Math.random() * 0.15 },
    ];

    const icd10Codes: string[] = [];
    if (skeletalMaturity === "delayed") icd10Codes.push("M89.30", "R62.51");
    if (skeletalMaturity === "advanced") icd10Codes.push("M89.39", "E22.0");
    if (fractureRisk === "high" || fractureRisk === "moderate") icd10Codes.push("M85.80");

    const recommendations: string[] = [];
    if (skeletalMaturity === "delayed") {
      recommendations.push("Repeat hand/wrist X-ray in 6 months");
      recommendations.push("Consider endocrine evaluation if Z-score persists below -2.0");
      recommendations.push("Monitor growth velocity (<4cm/year = abnormal for age)");
    } else if (skeletalMaturity === "advanced") {
      recommendations.push("Evaluate for precocious puberty if bone age > chronological age by 2+ years");
      recommendations.push("Consider endocrine referral for further assessment");
    } else {
      recommendations.push("Bone age within normal limits — routine follow-up recommended");
      recommendations.push("Repeat screening at next well-child visit or in 12 months");
    }

    const parentSummary = skeletalMaturity === "normal"
      ? `Your ${chronoAge}-month-old's bone development appears age-appropriate. The bone age (${boneAgeMonths.toFixed(1)} months) closely matches their actual age. No concerns at this time.`
      : skeletalMaturity === "delayed"
        ? `Your ${chronoAge}-month-old's bone development is slightly behind their actual age. This is common and often resolves on its own. Your doctor may recommend follow-up in 6 months.`
        : `Your ${chronoAge}-month-old's bone development is ahead of their actual age. This can be normal but may warrant a follow-up with your doctor to ensure healthy growth.`;

    const clinicalNotes = `Bone Age Assessment (Greulich-Pyle)\nChronological: ${chronoAge} months | Bone Age: ${boneAgeMonths.toFixed(1)} months\nZ-Score: ${boneAgeZScore.toFixed(2)} | Percentile: ${percentile}th\nSkeletal Maturity: ${skeletalMaturity.toUpperCase()}\nFracture Risk: ${fractureRisk.toUpperCase()}\nGrowth Velocity: ${growthVelocityCmYear.toFixed(1)} cm/year\nICD-10: ${icd10Codes.join(", ") || "None"}\nModel: medgemma-boneage-v1 (Greulich-Pyle standard)`;

    return {
      sessionId: input.studyId || `xray_${Date.now()}`,
      boneAgeMonths,
      chronologicalAgeMonths: chronoAge,
      boneAgeZScore,
      boneAgePercentile: percentile,
      growthVelocityCmYear,
      fractureRisk,
      skeletalMaturity,
      confidence: 0.85 + Math.random() * 0.1,
      keyLandmarks,
      icd10Codes,
      recommendations,
      inferenceTimeMs: Math.round(performance.now() - start),
      parentSummary,
      clinicalNotes,
    };
  }

  async runCTAnalysis(input: CTAnalysisInput): Promise<CTAnalysisResult> {
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 1800 + Math.random() * 600));

    const modality = input.volumeMeta.modality;
    const hemorrhageBase = modality === "CT_HEAD" ? 0.4 : 0.15;
    const necBase = modality === "CT_ABDOMEN" ? 0.35 : 0.1;
    const fractureBase = modality === "CT_MS" ? 0.4 : 0.2;

    const domainScores = {
      hemorrhageRisk: Math.min(1, hemorrhageBase + Math.random() * 0.45),
      fractureRisk: Math.min(1, fractureBase + Math.random() * 0.45),
      necRisk: Math.min(1, necBase + Math.random() * 0.45),
      tumorBurden: Math.min(1, 0.1 + Math.random() * 0.5),
    };

    const riskTier = inferCTRiskTier(domainScores);
    const keyFindings = generateCTKeyFindings(modality, domainScores, riskTier);
    const useCaseFlags = generateCTUseCaseFlags(modality, domainScores);
    const clinicalSummary = generateCTClinicalSummary(
      modality,
      domainScores,
      riskTier,
      input.volumeMeta.sliceCount
    );

    return {
      volumeId: input.volumeMeta.id,
      domainScores,
      riskTier,
      keyFindings,
      clinicalSummary,
      latencyMs: Math.round(performance.now() - start),
      modelVersion: "MedGemma-2B-IT-Q4",
      useCaseFlags,
    };
  }

  private getVocalMilestonesForAge(ageMonths: number): string[] {
    if (ageMonths < 4) return ["Startle response to sounds", "Cooing/gurgling", "Differentiated crying"];
    if (ageMonths < 7) return ["Babbling (ba, da, ga)", "Laughing", "Responding to name", "Vocal turn-taking"];
    if (ageMonths < 10) return ["Canonical babbling", "Varied intonation", "Imitating sounds", "Consonant chains"];
    if (ageMonths < 13) return ["First words (mama/dada)", "Understanding 'no'", "Pointing with vocalization", "Gesture + sound combos"];
    if (ageMonths < 19) return ["2-6 consistent words", "Following simple instructions", "Jargon speech", "Word approximations"];
    if (ageMonths < 25) return ["10-50 words", "2-word combinations", "Naming objects", "Using 'more' or 'mine'"];
    return ["Short sentences", "Asking questions", "Pronouncing most consonants", "Telling simple stories"];
  }
}

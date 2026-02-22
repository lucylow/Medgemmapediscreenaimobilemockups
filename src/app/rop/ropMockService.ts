import type {
  ROPScreeningResult,
  ImageQualityMetrics,
  ROPMetadata,
  EnhancedScreeningResult,
  PediatricScreeningInput,
} from "./ropTypes";

export function generateMockImageQuality(): ImageQualityMetrics {
  return {
    pupilDilation: 0.7 + Math.random() * 0.25,
    focusSharpness: 0.75 + Math.random() * 0.2,
    lightingEvenness: 0.7 + Math.random() * 0.25,
    vascularContrast: 0.65 + Math.random() * 0.3,
    overall: Math.round(75 + Math.random() * 20),
  };
}

export async function analyzeROPFrame(
  metadata: ROPMetadata
): Promise<ROPScreeningResult> {
  const start = performance.now();
  await new Promise((res) => setTimeout(res, 1200 + Math.random() * 800));

  const ga = metadata.gestationalAge;
  const pma = metadata.postMenstrualAge;
  const quality = generateMockImageQuality();

  const zoneRoll = Math.random();
  const zone = zoneRoll < 0.15 ? "I" as const : zoneRoll < 0.55 ? "II" as const : "III" as const;
  const stageRoll = Math.random();
  const stage = (stageRoll < 0.3 ? 0 : stageRoll < 0.6 ? 1 : stageRoll < 0.85 ? 2 : 3) as 0 | 1 | 2 | 3;
  const plusDisease = zone === "I" && stage >= 2 ? Math.random() > 0.5 : false;
  const tortuosity = 1 + Math.random() * 6;
  const dilation = 0.5 + Math.random() * 5;

  const etropType = plusDisease
    ? "Type 1 ROP - Treatment Required"
    : zone === "I" && stage >= 2
    ? "Type 1 Pre-threshold"
    : zone === "II" && stage >= 2
    ? "Type 2 - Close Observation"
    : "Type 2 Immature";

  const keyFindings: string[] = [
    `Zone ${zone}, Stage ${stage} ROP in ${ga < 28 ? "extreme" : ga < 32 ? "very" : "moderate"} preterm infant`,
    `Gestational age: ${ga} weeks, PMA: ${pma} weeks`,
    `Vascular tortuosity index: ${tortuosity.toFixed(1)}/10`,
    `Arteriolar dilation: ${dilation.toFixed(1)}/10`,
    plusDisease ? "Plus disease PRESENT - urgent ophthalmology referral" : "No plus disease detected",
    `Image quality: ${quality.overall}% (pupil ${(quality.pupilDilation * 100).toFixed(0)}%, focus ${(quality.focusSharpness * 100).toFixed(0)}%)`,
  ];

  const clinicalSummary = `${etropType} detected in ${ga}-week GA infant at PMA ${pma} weeks. ${
    plusDisease
      ? "Plus disease present with significant tortuosity and dilation. Immediate anti-VEGF or laser treatment indicated per ETROP criteria."
      : `No plus disease. ${stage >= 2 ? "Close serial examination recommended per AAP guidelines." : "Routine ROP screening schedule appropriate."}`
  }`;

  const recommendations = [
    ...(plusDisease
      ? [{
          priority: "immediate" as const,
          action: "Urgent pediatric ophthalmology referral for anti-VEGF/laser evaluation",
          timeline: "immediate" as const,
          evidence_level: "A" as const,
        }]
      : []),
    {
      priority: stage >= 2 ? ("high" as const) : ("medium" as const),
      action: `Follow-up ROP examination in ${stage >= 2 ? "1" : "2"} weeks`,
      timeline: stage >= 2 ? ("7d" as const) : ("14d" as const),
      evidence_level: "A" as const,
    },
    {
      priority: "medium" as const,
      action: "Document findings in NICU chart with zone/stage/plus notation",
      timeline: "immediate" as const,
      evidence_level: "B" as const,
    },
    {
      priority: "low" as const,
      action: "Continue standard NICU care with oxygen saturation monitoring",
      timeline: "28d" as const,
      evidence_level: "A" as const,
    },
  ];

  return {
    zone,
    stage,
    plusDisease,
    tortuosity,
    dilation,
    etropType,
    confidence: 0.87 + Math.random() * 0.1,
    qualityMetrics: quality,
    keyFindings,
    clinicalSummary,
    recommendations,
    latencyMs: Math.round(performance.now() - start),
  };
}

export async function analyzeScreeningEnhanced(
  input: PediatricScreeningInput
): Promise<EnhancedScreeningResult> {
  const start = performance.now();
  await new Promise((res) => setTimeout(res, 800 + Math.random() * 1200));

  const ageMonths = input.childAgeMonths;
  const hasRedFlags = input.parentReport.toLowerCase().includes("regression") ||
    input.parentReport.toLowerCase().includes("no words") ||
    input.parentReport.toLowerCase().includes("not walking");

  const riskRoll = hasRedFlags ? 0.9 : Math.random();
  const risk_level = riskRoll > 0.7 ? "referral" as const
    : riskRoll > 0.4 ? "urgent" as const
    : riskRoll > 0.15 ? "monitor" as const
    : "on_track" as const;

  const confidence = parseFloat((0.87 + Math.random() * 0.11).toFixed(2));

  const commScore = Math.round(8 + Math.random() * 12);
  const motorScore = Math.round(10 + Math.random() * 10);
  const socialScore = Math.round(7 + Math.random() * 13);
  const rawScore = commScore + motorScore + socialScore;
  const percentile = risk_level === "referral"
    ? Math.round(5 + Math.random() * 15)
    : risk_level === "urgent"
    ? Math.round(15 + Math.random() * 25)
    : risk_level === "monitor"
    ? Math.round(30 + Math.random() * 30)
    : Math.round(60 + Math.random() * 35);

  const icd10Map: Record<string, string[]> = {
    referral: ["F80.1", "R62.50", "F84.0"],
    urgent: ["F80.1", "R62.50"],
    monitor: ["R62.0"],
    on_track: [],
  };

  const key_findings = [
    `Expressive language ${ageMonths >= 24 ? (percentile < 30 ? "below expected 50+ words" : "developing appropriately") : "age-appropriate for milestones"}`,
    `Receptive language ${ageMonths >= 18 ? "follows 2-step directions" : "responds to simple commands"}`,
    `Motor milestones ${ageMonths >= 12 ? (risk_level === "referral" ? "delayed - not walking independently" : "within normal limits") : "emerging appropriately"}`,
    `Social engagement ${input.domain === "social" ? "limited peer interaction noted" : "typical reciprocal interaction observed"}`,
    `No regression of established skills observed`,
    `ASQ-3 equivalent: ${percentile}th percentile (raw ${rawScore}/60)`,
    hasRedFlags ? "RED FLAG: Potential regression or significant delay identified" : "No critical red flags identified",
  ];

  const clinical_summary = `MedGemma-2B-IT analysis indicates ${risk_level.replace("_", " ")} risk profile for ${ageMonths}-month-old ${input.gender === "M" ? "male" : input.gender === "F" ? "female" : "child"}. ASQ-3 equivalent score: ${rawScore}/60 (${percentile}th percentile). ${
    risk_level === "referral"
      ? "Immediate developmental pediatrician evaluation recommended. Multiple domains below cutoff threshold."
      : risk_level === "urgent"
      ? "Urgent follow-up recommended. One or more domains approaching cutoff threshold."
      : "Routine monitoring recommended with rescreening in 3 months."
  } Confidence: ${(confidence * 100).toFixed(0)}%.`;

  const recommendations: EnhancedScreeningResult["recommendations"] = [
    ...(risk_level === "referral"
      ? [{
          priority: "immediate" as const,
          action: "Refer to developmental pediatrician for comprehensive evaluation",
          timeline: "immediate" as const,
          evidence_level: "A" as const,
        }]
      : []),
    {
      priority: risk_level === "referral" ? "immediate" as const : "high" as const,
      action: "Complete formal ASQ-3 screening instrument",
      timeline: risk_level === "referral" ? "immediate" as const : "7d" as const,
      evidence_level: "A" as const,
    },
    ...(commScore < 12
      ? [{
          priority: "high" as const,
          action: `Speech-language therapy evaluation${ageMonths >= 24 ? " - <50 words at 24mo indicates expressive delay" : ""}`,
          timeline: "14d" as const,
          evidence_level: "A" as const,
        }]
      : []),
    {
      priority: "medium" as const,
      action: `Rescreen in ${risk_level === "on_track" ? "6" : "3"} months using standardized instrument`,
      timeline: "28d" as const,
      evidence_level: "B" as const,
    },
    {
      priority: "low" as const,
      action: "Provide CDC milestone checklist and developmental stimulation activities",
      timeline: "7d" as const,
      evidence_level: "C" as const,
    },
  ];

  return {
    risk_level,
    confidence,
    asq3_equivalent: {
      raw_score: rawScore,
      percentile,
      cutoff_flag: risk_level !== "on_track",
      domain_breakdown: {
        communication: commScore,
        motor: motorScore,
        social: socialScore,
      },
    },
    icd10_codes: icd10Map[risk_level] ?? [],
    key_findings,
    clinical_summary,
    recommendations,
    latencyMs: Math.round(performance.now() - start),
    modelVersion: "MedGemma-2B-IT-Q4 v2.1",
  };
}

export function mockTranscribeSpeech(): string {
  const transcripts = [
    "Parent reports child has limited expressive language with only 8-10 words at 24 months. Points to desired objects but does not name them. Follows simple 1-step directions. Plays alongside peers but minimal interactive play. Motor skills appear age-appropriate.",
    "Child is 18 months old and not yet walking independently. Cruises along furniture and takes supported steps. Babbles with varied intonation. Makes good eye contact and engages in social games like peek-a-boo. Uses 3-4 meaningful words.",
    "30-month-old using approximately 100 words and combining 2-3 word phrases. Runs, climbs, and kicks a ball. Engages in pretend play. Sometimes has difficulty with transitions and shows frustration. Follows 2-step directions consistently.",
    "12-month-old with good motor development - crawling, pulling to stand, taking first steps. Uses mama and dada specifically. Waves bye-bye. Points to interesting objects. Good appetite and sleep patterns. Up to date on vaccinations.",
  ];
  return transcripts[Math.floor(Math.random() * transcripts.length)];
}

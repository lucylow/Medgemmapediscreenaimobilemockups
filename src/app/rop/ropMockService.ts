import type {
  ROPScreeningResult,
  ImageQualityMetrics,
  ROPMetadata,
  EnhancedScreeningResult,
  PediatricScreeningInput,
  DevelopmentalDomain,
} from "./ropTypes";

export function generateMockImageQuality(): ImageQualityMetrics {
  const pupilDilation = 0.7 + Math.random() * 0.25;
  const focusSharpness = 0.75 + Math.random() * 0.2;
  const lightingEvenness = 0.7 + Math.random() * 0.25;
  const vascularContrast = 0.65 + Math.random() * 0.3;

  const overall = Math.round(
    (pupilDilation * 0.4 +
      focusSharpness * 0.25 +
      lightingEvenness * 0.20 +
      vascularContrast * 0.15) * 100
  );

  return {
    pupilDilation,
    focusSharpness,
    lightingEvenness,
    vascularContrast,
    overall: Math.max(0, Math.min(100, overall)),
  };
}

export function simulateMedSigLIPEmbedding(): {
  embedding: Float32Array;
  latencyMs: number;
} {
  const embedding = new Float32Array(512);
  for (let i = 0; i < 512; i++) {
    embedding[i] = (Math.sin(i * 0.1) + 1) / 2;
  }
  return {
    embedding,
    latencyMs: Math.round(180 + Math.random() * 120),
  };
}

interface DomainClinicalProfile {
  icd10: string[];
  riskBias: number;
  summaryTemplate: (age: number, gender: string, percentile: number) => string;
  domainKeys: string[];
  redFlagCheck: (report: string, age: number) => boolean;
  specificRecs: string[];
}

const DOMAIN_PROFILES: Record<string, DomainClinicalProfile> = {
  communication: {
    icd10: ["F80.1", "F80.2", "R62.50"],
    riskBias: 0.3,
    summaryTemplate: (age, gender, pct) =>
      `${age}mo ${gender} with expressive language at ${pct}th percentile. ${pct < 25 ? "Below expected vocabulary range for age. Speech-language evaluation indicated." : "Language development within normal limits for age."}`,
    domainKeys: ["expressive_language", "receptive_language", "articulation"],
    redFlagCheck: (report, age) =>
      (age >= 24 && /no words|few words|not talking/i.test(report)) ||
      (age >= 12 && /no babbl/i.test(report)),
    specificRecs: [
      "Speech-language pathology evaluation",
      "Implement daily 15-minute language stimulation activities",
      "Model 2-3 word phrases during daily routines",
    ],
  },
  gross_motor: {
    icd10: ["F82", "R62.0", "R26.2"],
    riskBias: 0.2,
    summaryTemplate: (age, gender, pct) =>
      `${age}mo ${gender} gross motor development at ${pct}th percentile. ${pct < 25 ? "Delayed motor milestones noted. Physical therapy referral recommended." : "Motor milestones age-appropriate."}`,
    domainKeys: ["balance", "locomotion", "coordination"],
    redFlagCheck: (report, age) =>
      (age >= 18 && /not walking|can't walk/i.test(report)) ||
      (age >= 9 && /not sitting|can't sit/i.test(report)),
    specificRecs: [
      "Pediatric physical therapy evaluation",
      "Supervised tummy time and floor exploration",
      "Assess for hypotonia or joint laxity",
    ],
  },
  fine_motor: {
    icd10: ["F82", "R27.8"],
    riskBias: 0.15,
    summaryTemplate: (age, gender, pct) =>
      `${age}mo ${gender} fine motor skills at ${pct}th percentile. ${pct < 25 ? "Difficulty with age-appropriate grasp and manipulation tasks." : "Fine motor development progressing normally."}`,
    domainKeys: ["grasp", "manipulation", "hand_eye"],
    redFlagCheck: (report, age) =>
      (age >= 12 && /can't grasp|no pincer/i.test(report)) ||
      (age >= 24 && /can't stack|can't draw/i.test(report)),
    specificRecs: [
      "Occupational therapy evaluation for fine motor skills",
      "Provide age-appropriate manipulative toys",
      "Practice self-feeding with finger foods",
    ],
  },
  problem_solving: {
    icd10: ["F88", "R41.840"],
    riskBias: 0.2,
    summaryTemplate: (age, gender, pct) =>
      `${age}mo ${gender} problem-solving/cognitive skills at ${pct}th percentile. ${pct < 25 ? "Below expected cognitive milestones. Comprehensive developmental evaluation recommended." : "Cognitive development within expected range."}`,
    domainKeys: ["reasoning", "object_permanence", "cause_effect"],
    redFlagCheck: (report, age) =>
      (age >= 12 && /not pointing|no interest/i.test(report)) ||
      /regression|lost skills/i.test(report),
    specificRecs: [
      "Developmental pediatrician evaluation",
      "Structured play activities targeting cause-and-effect understanding",
      "Assess hearing and vision as contributing factors",
    ],
  },
  personal_social: {
    icd10: ["F84.0", "F84.9", "R46.0"],
    riskBias: 0.25,
    summaryTemplate: (age, gender, pct) =>
      `${age}mo ${gender} personal-social development at ${pct}th percentile. ${pct < 25 ? "Limited social reciprocity and peer engagement. Autism screening (M-CHAT-R/F) recommended." : "Social engagement and self-help skills age-appropriate."}`,
    domainKeys: ["social_reciprocity", "self_help", "emotional_regulation"],
    redFlagCheck: (report, age) =>
      /no eye contact|hand.?flap|spinning|regression/i.test(report) ||
      (age >= 18 && /no pointing|not responding.*name/i.test(report)),
    specificRecs: [
      "Administer M-CHAT-R/F autism screening",
      "Pediatric developmental specialist referral",
      "Structured social interaction activities",
      "Parent training in responsive interaction strategies",
    ],
  },
  rop_screening: {
    icd10: ["H35.09", "H35.10"],
    riskBias: 0.4,
    summaryTemplate: (age, gender, pct) =>
      `Retinal screening for ${age}mo preterm infant. ${pct < 30 ? "Abnormal retinal findings detected. Ophthalmology referral required." : "Retinal vasculature developing normally."}`,
    domainKeys: ["retinal_vascular", "optic_disc", "peripheral_retina"],
    redFlagCheck: () => false,
    specificRecs: [
      "Pediatric ophthalmology referral within 48 hours",
      "Weekly ROP monitoring per AAP guidelines",
      "Document findings in NICU chart",
    ],
  },
};

export async function analyzeROPFrame(
  metadata: ROPMetadata
): Promise<ROPScreeningResult> {
  const start = performance.now();

  const medsigLip = simulateMedSigLIPEmbedding();
  await new Promise((res) => setTimeout(res, medsigLip.latencyMs));

  await new Promise((res) => setTimeout(res, 800 + Math.random() * 600));

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

  const isType1 = plusDisease ||
    (zone === "I" && stage >= 3) ||
    (zone === "I" && stage === 2 && tortuosity > 5);
  const isType2 = !isType1 && (
    (zone === "I" && stage >= 1) ||
    (zone === "II" && stage >= 2) ||
    (zone === "II" && stage === 3 && !plusDisease)
  );

  const etropType = isType1
    ? "Type 1 ROP - Treatment Required"
    : isType2
    ? "Type 2 ROP - Close Observation"
    : stage === 0
    ? "Immature Retina - Normal for GA"
    : "Type 2 - Low Risk";

  const urgency: "emergent" | "urgent" | "monitor" | "routine" = isType1
    ? (plusDisease ? "emergent" : "urgent")
    : isType2
    ? "monitor"
    : "routine";

  const avShuntDetected = zone === "I" && stage >= 2 && tortuosity > 4;

  const keyFindings: string[] = [
    `Zone ${zone}, Stage ${stage} ROP in ${ga < 28 ? "extreme" : ga < 32 ? "very" : "moderate"} preterm infant`,
    `ETROP Classification: ${etropType}`,
    `Urgency: ${urgency.toUpperCase()}`,
    `Gestational age: ${ga} weeks, PMA: ${pma} weeks`,
    `Vascular tortuosity index: ${tortuosity.toFixed(1)}/10${tortuosity > 5 ? " (ELEVATED)" : ""}`,
    `Arteriolar dilation: ${dilation.toFixed(1)}/10${dilation > 5 ? " (ELEVATED)" : ""}`,
    plusDisease ? "Plus disease PRESENT - urgent ophthalmology referral" : "No plus disease detected",
    avShuntDetected ? "AV shunt detected - vascular abnormality in zone boundary" : "No AV shunt detected",
    `Image quality: ${quality.overall}% (pupil ${(quality.pupilDilation * 100).toFixed(0)}%, focus ${(quality.focusSharpness * 100).toFixed(0)}%, lighting ${(quality.lightingEvenness * 100).toFixed(0)}%, vascular ${(quality.vascularContrast * 100).toFixed(0)}%)`,
    `MedSigLIP embedding: 512-dim vector (${medsigLip.latencyMs}ms)`,
  ];

  const clinicalSummary = `${etropType} detected in ${ga}-week GA infant at PMA ${pma} weeks. ` +
    (plusDisease
      ? `Plus disease present with tortuosity ${tortuosity.toFixed(1)}/10 and dilation ${dilation.toFixed(1)}/10. Immediate anti-VEGF or laser treatment indicated per ETROP criteria.`
      : isType1
      ? `Type 1 criteria met (Zone ${zone}, Stage ${stage}). Prompt treatment evaluation recommended per ETROP guidelines.`
      : isType2
      ? `Type 2 criteria met. Close serial examination recommended per AAP guidelines with ${stage >= 2 ? "weekly" : "biweekly"} follow-up.`
      : stage === 0
      ? `Immature retinal vasculature consistent with gestational age. Routine screening per AAP schedule.`
      : `Low-risk findings. Routine ROP screening schedule appropriate.`) +
    (avShuntDetected ? " Arteriovenous shunt detected at zone boundary — monitor closely for progression." : "");

  const recommendations = [
    ...(urgency === "emergent"
      ? [{
          priority: "immediate" as const,
          action: "EMERGENT: Pediatric ophthalmology referral within 24-48h for anti-VEGF/laser evaluation (ETROP Type 1)",
          timeline: "immediate" as const,
          evidence_level: "A" as const,
        }]
      : urgency === "urgent"
      ? [{
          priority: "immediate" as const,
          action: "URGENT: Ophthalmology evaluation within 72h for Type 1 ROP treatment planning",
          timeline: "immediate" as const,
          evidence_level: "A" as const,
        }]
      : []),
    {
      priority: isType1 ? ("immediate" as const) : stage >= 2 ? ("high" as const) : ("medium" as const),
      action: `Follow-up ROP examination in ${isType1 ? "3-7 days" : isType2 ? "1 week" : stage >= 1 ? "2 weeks" : "4 weeks"} per ETROP protocol`,
      timeline: isType1 ? ("7d" as const) : isType2 ? ("7d" as const) : ("14d" as const),
      evidence_level: "A" as const,
    },
    {
      priority: "medium" as const,
      action: `Document Zone ${zone}/Stage ${stage}/${plusDisease ? "Plus+" : "Plus-"} in NICU chart with ETROP classification`,
      timeline: "immediate" as const,
      evidence_level: "B" as const,
    },
    ...(avShuntDetected
      ? [{
          priority: "high" as const,
          action: "Monitor AV shunt at zone boundary — risk of rapid progression",
          timeline: "7d" as const,
          evidence_level: "B" as const,
        }]
      : []),
    {
      priority: "low" as const,
      action: "Continue oxygen saturation targeting per unit protocol (SpO2 91-95% for preterm)",
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

function resolveDomain(domain?: DevelopmentalDomain): string {
  if (!domain || domain === "comprehensive") return "comprehensive";
  if (domain === "motor") return "gross_motor";
  if (domain === "social") return "personal_social";
  if (domain === "cognitive") return "problem_solving";
  return domain;
}

export async function analyzeScreeningEnhanced(
  input: PediatricScreeningInput
): Promise<EnhancedScreeningResult> {
  const start = performance.now();
  await new Promise((res) => setTimeout(res, 800 + Math.random() * 1200));

  const ageMonths = input.childAgeMonths;
  const genderLabel = input.gender === "M" ? "male" : input.gender === "F" ? "female" : "child";
  const resolvedDomain = resolveDomain(input.domain);
  const profile = DOMAIN_PROFILES[resolvedDomain] ?? DOMAIN_PROFILES.communication;

  const hasRedFlags = profile.redFlagCheck(input.parentReport, ageMonths) ||
    /regression|lost skills/i.test(input.parentReport);

  const riskBias = profile.riskBias + (hasRedFlags ? 0.5 : 0);
  const riskRoll = Math.random() + riskBias;
  const risk_level: EnhancedScreeningResult["risk_level"] =
    riskRoll > 1.1 ? "referral"
    : riskRoll > 0.7 ? "urgent"
    : riskRoll > 0.35 ? "monitor"
    : "on_track";

  const confidence = parseFloat((0.87 + Math.random() * 0.11).toFixed(2));

  const domainScores: Record<string, number> = {};
  const domainKeys = resolvedDomain === "comprehensive"
    ? ["communication", "gross_motor", "fine_motor", "problem_solving", "personal_social"]
    : profile.domainKeys;

  let totalScore = 0;
  for (const key of domainKeys) {
    const base = risk_level === "referral" ? 4 : risk_level === "urgent" ? 7 : risk_level === "monitor" ? 10 : 13;
    const score = Math.min(20, Math.max(2, Math.round(base + Math.random() * 7)));
    domainScores[key] = score;
    totalScore += score;
  }

  const rawScore = Math.min(60, totalScore);
  const percentile = risk_level === "referral"
    ? Math.round(5 + Math.random() * 15)
    : risk_level === "urgent"
    ? Math.round(15 + Math.random() * 25)
    : risk_level === "monitor"
    ? Math.round(30 + Math.random() * 30)
    : Math.round(60 + Math.random() * 35);

  const icd10_codes = risk_level === "on_track" ? [] :
    risk_level === "monitor" ? [profile.icd10[0]] :
    profile.icd10.slice(0, risk_level === "referral" ? 3 : 2);

  const key_findings: string[] = [];
  if (resolvedDomain === "comprehensive") {
    key_findings.push(
      `Multi-domain screening for ${ageMonths}mo ${genderLabel}`,
      `Communication: ${domainScores.communication ?? "N/A"}/20 ${(domainScores.communication ?? 20) < 10 ? "(below cutoff)" : ""}`,
      `Gross Motor: ${domainScores.gross_motor ?? "N/A"}/20 ${(domainScores.gross_motor ?? 20) < 10 ? "(below cutoff)" : ""}`,
      `Fine Motor: ${domainScores.fine_motor ?? "N/A"}/20`,
      `Problem Solving: ${domainScores.problem_solving ?? "N/A"}/20`,
      `Personal-Social: ${domainScores.personal_social ?? "N/A"}/20`,
    );
  } else {
    key_findings.push(
      `${resolvedDomain.replace("_", " ")} domain screening for ${ageMonths}mo ${genderLabel}`,
    );
    for (const key of domainKeys) {
      key_findings.push(
        `${key.replace("_", " ")}: ${domainScores[key]}/20 ${domainScores[key] < 10 ? "(below cutoff)" : "(within range)"}`,
      );
    }
  }

  key_findings.push(
    `ASQ-3 equivalent: ${percentile}th percentile (raw ${rawScore}/60)`,
    hasRedFlags ? "RED FLAG: Clinical concern identified from parent report" : "No critical red flags from parent observations",
    `CDC milestone tolerance: ±2 months applied`,
    risk_level === "referral" ? "IMMEDIATE REFERRAL: Multiple indicators below threshold" : "",
  );

  const clinical_summary = resolvedDomain === "comprehensive"
    ? `MedGemma-2B-IT comprehensive analysis: ${risk_level.replace("_", " ")} for ${ageMonths}mo ${genderLabel}. ASQ-3 equivalent: ${rawScore}/60 (${percentile}th percentile). ${
        risk_level === "referral"
          ? "Multiple domains below cutoff. Immediate comprehensive developmental evaluation recommended."
          : risk_level === "urgent"
          ? "One or more domains approaching cutoff. Urgent follow-up recommended."
          : risk_level === "monitor"
          ? "Borderline scores in select domains. Rescreening in 3 months."
          : "All domains within normal limits. Routine monitoring."
      } Confidence: ${(confidence * 100).toFixed(0)}%.`
    : `${profile.summaryTemplate(ageMonths, genderLabel, percentile)} ASQ-3 equivalent: ${rawScore}/60 (${percentile}th percentile). Confidence: ${(confidence * 100).toFixed(0)}%.`;

  const recommendations: EnhancedScreeningResult["recommendations"] = [];

  if (risk_level === "referral") {
    recommendations.push({
      priority: "immediate",
      action: "Refer to developmental pediatrician for comprehensive evaluation",
      timeline: "immediate",
      evidence_level: "A",
    });
  }

  recommendations.push({
    priority: risk_level === "referral" ? "immediate" : "high",
    action: "Complete formal ASQ-3 screening instrument to confirm findings",
    timeline: risk_level === "referral" ? "immediate" : "7d",
    evidence_level: "A",
  });

  if (risk_level !== "on_track") {
    for (const rec of profile.specificRecs.slice(0, 2)) {
      recommendations.push({
        priority: risk_level === "referral" ? "high" : "medium",
        action: rec,
        timeline: "14d",
        evidence_level: "A",
      });
    }
  }

  recommendations.push({
    priority: "medium",
    action: `Rescreen in ${risk_level === "on_track" ? "6" : "3"} months using standardized instrument`,
    timeline: "28d",
    evidence_level: "B",
  });

  recommendations.push({
    priority: "low",
    action: "Provide CDC milestone checklist and developmental stimulation activities for home",
    timeline: "7d",
    evidence_level: "C",
  });

  return {
    risk_level,
    confidence,
    asq3_equivalent: {
      raw_score: rawScore,
      percentile,
      cutoff_flag: risk_level !== "on_track",
      domain_breakdown: domainScores,
    },
    icd10_codes,
    key_findings: key_findings.filter(Boolean),
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

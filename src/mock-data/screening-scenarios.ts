import {
  CHILD_NAMES,
  CHW_NAMES,
  CLINIC_LOCATIONS,
  seededRandom,
  pickRandom,
  pickWeighted,
  type MockChildProfile,
} from "./child-profiles";
import {
  getAgeBand,
  getObservation,
  ICD10_BY_DOMAIN,
  RECOMMENDATIONS_BY_RISK,
  PARENT_REPORT_TEMPLATES,
  MCHAT_R_FLAGS,
  ROP_SCREENING_OBS,
} from "./observations";

export type ScenarioRisk = "on_track" | "monitor" | "urgent" | "referral";
export type ScenarioDomain =
  | "communication"
  | "gross_motor"
  | "fine_motor"
  | "problem_solving"
  | "personal_social"
  | "rop_screening"
  | "comprehensive";

export interface ScreeningScenario {
  id: string;
  childName: string;
  childAge: number;
  childSex: "male" | "female";
  childLanguage?: string;
  childRegion?: string;
  domain: ScenarioDomain;
  primaryDomain: string;
  setting: "home" | "clinic" | "field";
  chwName: string;
  clinicLocation: string;
  observations: string;
  chwNotes: string;
  riskLevel: ScenarioRisk;
  confidence: number;
  asq3Score: number;
  asq3Percentile: number;
  asq3CutoffFlag: boolean;
  icd10Codes: string[];
  keyFindings: string[];
  clinicalSummary: string;
  recommendations: ScenarioRecommendation[];
  domainBreakdown: Record<string, number>;
  gestationalAgeWeeks?: number;
  correctedAge?: number;
  parentReport?: string;
  mchatRScore?: number;
  mchatRFlag?: string;
  etropClassification?: {
    zone: string;
    stage: number;
    plusDisease: boolean;
    type: string;
    tortuosityScore: number;
    dilationScore: number;
  };
  timestamp: string;
  modelVersion: string;
  inferenceTimeMs: number;
}

export interface ScenarioRecommendation {
  action: string;
  timeline: "immediate" | "7d" | "14d" | "28d";
  priority: "immediate" | "high" | "medium" | "low";
  evidence_level: "A" | "B" | "C";
}

const ALL_DOMAINS: ScenarioDomain[] = [
  "communication",
  "gross_motor",
  "fine_motor",
  "problem_solving",
  "personal_social",
  "rop_screening",
  "comprehensive",
];

const DOMAIN_WEIGHTS = [32, 13, 13, 12, 22, 8, 0];

const SETTINGS: Array<"home" | "clinic" | "field"> = ["home", "clinic", "field"];

const RISK_DISTRIBUTION: ScenarioRisk[] = ["on_track", "monitor", "urgent", "referral"];
const RISK_WEIGHTS = [40, 30, 18, 12];

const SEVERITY_MAP: Record<ScenarioRisk, "on_track" | "monitor" | "concern" | "red_flag"> = {
  on_track: "on_track",
  monitor: "monitor",
  urgent: "concern",
  referral: "red_flag",
};

function generateKeyFindings(
  domain: string,
  riskLevel: ScenarioRisk,
  ageMonths: number,
  rng: () => number
): string[] {
  const findings: string[] = [];
  const ageBand = getAgeBand(ageMonths);

  if (riskLevel === "on_track") {
    const positives: Record<string, string[]> = {
      communication: [
        "Age-appropriate vocabulary",
        "Responds to name consistently",
        "Uses gestures appropriately",
        "Follows age-appropriate commands",
        "Babbling/speech within normal range",
      ],
      gross_motor: [
        "Age-appropriate mobility",
        "Good balance and coordination",
        "Meets gross motor milestones",
        "Active and physically engaged",
        "Normal muscle tone",
      ],
      fine_motor: [
        "Appropriate grasp development",
        "Good hand-eye coordination",
        "Age-appropriate drawing skills",
        "Self-feeding appropriately",
        "Normal fine motor progression",
      ],
      problem_solving: [
        "Age-appropriate problem solving",
        "Shows curiosity and exploration",
        "Understands cause and effect",
        "Engages in pretend play",
        "Completes age-appropriate puzzles",
      ],
      personal_social: [
        "Appropriate social engagement",
        "Shows attachment to caregivers",
        "Age-appropriate emotional range",
        "Engages in cooperative play",
        "Shows empathy for others",
      ],
    };
    const domainFindings = positives[domain] || positives["communication"];
    const count = 3 + Math.floor(rng() * 2);
    const shuffled = [...domainFindings].sort(() => rng() - 0.5);
    return shuffled.slice(0, count).map((f) => `✅ ${f}`);
  }

  const negatives: Record<string, Record<string, string[]>> = {
    communication: {
      monitor: [
        "⚠️ Vocabulary slightly below age expectations",
        "✅ Follows simple commands",
        "⚠️ Limited word combinations",
        "✅ Points to body parts",
        "⚠️ Speech clarity below age norms",
      ],
      urgent: [
        "❌ Vocabulary significantly below expectations",
        "❌ No word combinations at expected age",
        "✅ Some receptive language present",
        "⚠️ Limited use of gestures",
        "❌ Difficulty following 2-step commands",
      ],
      referral: [
        "❌ No meaningful words",
        "❌ No pointing or gestures",
        "❌ Loss of previously acquired words",
        "❌ No response to name",
        "❌ No joint attention",
      ],
    },
    gross_motor: {
      monitor: [
        "⚠️ Slightly delayed gross motor milestones",
        "✅ Can walk/move but unsteadily",
        "⚠️ Balance below age expectations",
        "✅ Attempts age-appropriate activities",
      ],
      urgent: [
        "❌ Significant motor delay",
        "❌ Cannot perform age-expected mobility",
        "⚠️ Frequent falls beyond normal",
        "❌ Poor muscle tone noted",
      ],
      referral: [
        "❌ Motor milestone regression",
        "❌ Unable to bear weight/walk at expected age",
        "❌ Asymmetric movements noted",
        "❌ Significant muscle weakness",
      ],
    },
    fine_motor: {
      monitor: [
        "⚠️ Grasp development slightly behind",
        "✅ Can hold objects but with difficulty",
        "⚠️ Drawing skills below age norms",
        "✅ Attempting self-feeding",
      ],
      urgent: [
        "❌ Significant fine motor delay",
        "❌ Cannot stack/build at age level",
        "⚠️ Very poor pencil/crayon control",
        "❌ Difficulty with self-care tasks",
      ],
      referral: [
        "❌ Fine motor skill regression",
        "❌ Cannot grasp objects appropriately",
        "❌ No drawing/scribbling at expected age",
        "❌ Persistent hand preference before 12 months",
      ],
    },
    problem_solving: {
      monitor: [
        "⚠️ Problem solving slightly below age",
        "✅ Shows some curiosity",
        "⚠️ Limited pretend play",
        "✅ Understands some cause-effect",
      ],
      urgent: [
        "❌ Significant cognitive delay",
        "❌ No pretend play at expected age",
        "❌ Cannot complete simple puzzles",
        "⚠️ Limited exploration strategies",
      ],
      referral: [
        "❌ Cognitive regression noted",
        "❌ No functional play",
        "❌ No problem-solving attempts",
        "❌ Very limited understanding for age",
      ],
    },
    personal_social: {
      monitor: [
        "⚠️ Limited peer interaction",
        "✅ Shows attachment to caregivers",
        "⚠️ Difficulty with turn-taking",
        "✅ Some emotional expression",
      ],
      urgent: [
        "❌ No interest in other children",
        "❌ Limited emotional range",
        "⚠️ Does not imitate social behaviors",
        "❌ No cooperative play at expected age",
      ],
      referral: [
        "❌ No social reciprocity",
        "❌ No joint attention",
        "❌ Social skill regression",
        "❌ No attachment behaviors",
        "❌ Loss of shared enjoyment",
      ],
    },
  };

  const level = riskLevel === "referral" ? "referral" : riskLevel === "urgent" ? "urgent" : "monitor";
  const domainNeg = negatives[domain]?.[level] || negatives["communication"][level];
  const count = 3 + Math.floor(rng() * 2);
  const shuffled = [...domainNeg].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

function generateClinicalSummary(
  childName: string,
  ageMonths: number,
  domain: string,
  riskLevel: ScenarioRisk,
  rng: () => number
): string {
  const ageStr = ageMonths < 12 ? `${ageMonths}-month-old` : `${ageMonths}-month-old`;
  const domainLabel: Record<string, string> = {
    communication: "communication/language",
    gross_motor: "gross motor",
    fine_motor: "fine motor",
    problem_solving: "problem solving/cognitive",
    personal_social: "personal-social/emotional",
    rop_screening: "retinopathy of prematurity (ROP)",
    comprehensive: "overall developmental",
  };
  const dLabel = domainLabel[domain] || "developmental";

  const summaries: Record<ScenarioRisk, string[]> = {
    on_track: [
      `${ageStr} child demonstrates age-appropriate ${dLabel} skills. All observed milestones within expected range. No areas of concern identified during screening.`,
      `Screening of ${ageStr} child shows ${dLabel} development within normal limits. Child is meeting expected milestones for age. Continue routine monitoring.`,
      `${ageStr} child's ${dLabel} performance is consistent with age expectations. Development appears to be progressing normally across observed areas.`,
    ],
    monitor: [
      `${ageStr} child shows mild delay in ${dLabel} domain. Some milestones are emerging but not fully achieved. Recommend monitoring and targeted activities.`,
      `Screening reveals ${dLabel} skills slightly below age expectations in ${ageStr} child. Most other domains appear on track. Close monitoring recommended.`,
      `${ageStr} child demonstrates emerging but incomplete ${dLabel} skills. Current performance suggests mild delay warranting follow-up screening in 4-6 weeks.`,
    ],
    urgent: [
      `${ageStr} child shows significant ${dLabel} delay requiring clinical attention. Multiple milestones not achieved within expected timeframe. Formal evaluation recommended.`,
      `Screening of ${ageStr} child reveals notable ${dLabel} concerns. Performance is significantly below age expectations. Referral for comprehensive evaluation advised.`,
      `${ageStr} child demonstrates concerning ${dLabel} patterns. Several critical milestones are absent. Urgent clinical review and early intervention referral recommended.`,
    ],
    referral: [
      `${ageStr} child presents with severe ${dLabel} delay. Critical milestones absent with possible regression noted. Immediate specialist referral required.`,
      `Screening reveals critical ${dLabel} concerns in ${ageStr} child. Multiple red flags identified including possible skill regression. Immediate developmental pediatrics referral.`,
      `${ageStr} child shows alarming ${dLabel} profile with absence of key milestones and possible loss of previously acquired skills. Immediate multidisciplinary evaluation required.`,
    ],
  };

  return pickRandom(summaries[riskLevel], rng);
}

function generateCHWNotes(
  domain: string,
  riskLevel: ScenarioRisk,
  setting: string,
  rng: () => number
): string {
  const notes: string[] = [
    `Observed during ${setting} visit. Child was ${rng() > 0.5 ? "cooperative" : "initially shy but warmed up"} during screening.`,
    `Parent ${rng() > 0.6 ? "expressed concerns about" : "inquired about"} developmental progress.`,
  ];

  if (riskLevel !== "on_track") {
    const concerns = [
      "Parent reports similar concerns at home.",
      "Discussed importance of early intervention with family.",
      "Family receptive to follow-up recommendations.",
      "Noted environmental factors that may be contributing.",
      "Multiple siblings - comparing development to older child.",
      "First-time parent seeking guidance on milestones.",
    ];
    notes.push(pickRandom(concerns, rng));
  }

  if (riskLevel === "referral" || riskLevel === "urgent") {
    notes.push(
      rng() > 0.5
        ? "Discussed referral pathway with family. Transportation assistance may be needed."
        : "Family agreed to schedule specialist appointment. Will follow up in 1 week."
    );
  }

  return notes.join(" ");
}

function generateDomainBreakdown(
  primaryDomain: string,
  riskLevel: ScenarioRisk,
  rng: () => number
): Record<string, number> {
  const domains = ["communication", "gross_motor", "fine_motor", "problem_solving", "personal_social"];
  const breakdown: Record<string, number> = {};

  for (const d of domains) {
    if (d === primaryDomain) {
      const scores: Record<ScenarioRisk, [number, number]> = {
        on_track: [8, 12],
        monitor: [5, 8],
        urgent: [2, 5],
        referral: [0, 3],
      };
      const [min, max] = scores[riskLevel];
      breakdown[d] = min + Math.floor(rng() * (max - min + 1));
    } else {
      const base = riskLevel === "referral" ? 4 : riskLevel === "urgent" ? 6 : 8;
      breakdown[d] = base + Math.floor(rng() * (13 - base));
    }
  }

  return breakdown;
}

function generateParentReport(
  domain: string,
  riskLevel: ScenarioRisk,
  ageMonths: number,
  rng: () => number
): string | undefined {
  if (domain === "rop_screening") return undefined;
  const domainTemplates = PARENT_REPORT_TEMPLATES[domain];
  if (!domainTemplates) return undefined;
  const riskKey = riskLevel === "urgent" ? "urgent" : riskLevel;
  const templates = domainTemplates[riskKey] || domainTemplates["on_track"];
  if (!templates || templates.length === 0) return undefined;
  const template = pickRandom(templates, rng);
  const wordCount = riskLevel === "on_track"
    ? 40 + Math.floor(rng() * 60)
    : riskLevel === "monitor"
    ? 10 + Math.floor(rng() * 25)
    : riskLevel === "urgent"
    ? 3 + Math.floor(rng() * 8)
    : 1 + Math.floor(rng() * 4);
  return template
    .replace(/\{WORDS\}/g, wordCount.toString())
    .replace(/\{AGE\}/g, ageMonths.toString());
}

function generateROPObservation(
  riskLevel: ScenarioRisk,
  gestationalAge: number,
  rng: () => number
): string {
  const severity = SEVERITY_MAP[riskLevel];
  const category = gestationalAge < 30 ? "preterm_extreme" : "preterm_moderate";
  const obs = ROP_SCREENING_OBS[category]?.[severity];
  if (!obs || obs.length === 0) return "ROP screening performed. Results pending specialist review.";
  return pickRandom(obs, rng);
}

function generateETROP(
  riskLevel: ScenarioRisk,
  rng: () => number
): ScreeningScenario["etropClassification"] {
  if (riskLevel === "on_track") {
    return { zone: "III", stage: 0, plusDisease: false, type: "None", tortuosityScore: parseFloat((0.5 + rng() * 1.5).toFixed(1)), dilationScore: parseFloat((0.3 + rng() * 1.0).toFixed(1)) };
  }
  if (riskLevel === "monitor") {
    return { zone: "II", stage: 1 + Math.floor(rng() * 2), plusDisease: false, type: "Type 2", tortuosityScore: parseFloat((2.0 + rng() * 2.0).toFixed(1)), dilationScore: parseFloat((1.5 + rng() * 2.0).toFixed(1)) };
  }
  if (riskLevel === "urgent") {
    return { zone: rng() > 0.5 ? "I" : "II", stage: 2, plusDisease: rng() > 0.5, type: "Type 2", tortuosityScore: parseFloat((4.0 + rng() * 2.0).toFixed(1)), dilationScore: parseFloat((3.0 + rng() * 2.0).toFixed(1)) };
  }
  return { zone: "I", stage: 3, plusDisease: true, type: "Type 1", tortuosityScore: parseFloat((6.0 + rng() * 3.0).toFixed(1)), dilationScore: parseFloat((5.0 + rng() * 3.0).toFixed(1)) };
}

function generateMCHATR(
  domain: string,
  riskLevel: ScenarioRisk,
  ageMonths: number,
  rng: () => number
): { score?: number; flag?: string } {
  if (ageMonths < 16 || ageMonths > 30) return {};
  if (domain !== "communication" && domain !== "personal_social" && domain !== "comprehensive") return {};
  if (rng() > 0.6) return {};

  if (riskLevel === "referral") {
    const score = 8 + Math.floor(rng() * 5);
    return { score, flag: pickRandom(MCHAT_R_FLAGS["high_risk"], rng) };
  }
  if (riskLevel === "urgent") {
    const score = 3 + Math.floor(rng() * 5);
    return { score, flag: pickRandom(MCHAT_R_FLAGS["moderate_risk"], rng) };
  }
  const score = Math.floor(rng() * 3);
  return { score, flag: pickRandom(MCHAT_R_FLAGS["low_risk"], rng) };
}

export function generateScreeningDataset(count: number = 2500, seed: number = 42): ScreeningScenario[] {
  const rng = seededRandom(seed);
  const scenarios: ScreeningScenario[] = [];
  const now = Date.now();
  const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const profile = pickRandom(CHILD_NAMES, rng);
    const domain = pickWeighted(ALL_DOMAINS, DOMAIN_WEIGHTS, rng);
    const isROP = domain === "rop_screening";

    const childAge = isROP
      ? 1 + Math.floor(rng() * 11)
      : 1 + Math.floor(rng() * 59);

    const primaryDomain =
      domain === "comprehensive"
        ? pickRandom(["communication", "gross_motor", "fine_motor", "problem_solving", "personal_social"], rng)
        : domain;
    const riskLevel = pickWeighted(RISK_DISTRIBUTION, RISK_WEIGHTS, rng);
    const setting = isROP ? "clinic" as const : pickRandom(SETTINGS, rng);
    const chwName = pickRandom(CHW_NAMES, rng);
    const location = pickRandom(CLINIC_LOCATIONS, rng);
    const ageBand = getAgeBand(childAge);
    const severity = SEVERITY_MAP[riskLevel];

    const confidenceRanges: Record<ScenarioRisk, [number, number]> = {
      on_track: [0.88, 0.99],
      monitor: [0.78, 0.92],
      urgent: [0.72, 0.88],
      referral: [0.82, 0.97],
    };
    const [cMin, cMax] = confidenceRanges[riskLevel];
    const confidence = parseFloat((cMin + rng() * (cMax - cMin)).toFixed(3));

    const asq3Ranges: Record<ScenarioRisk, [number, number]> = {
      on_track: [42, 60],
      monitor: [25, 42],
      urgent: [12, 28],
      referral: [0, 15],
    };
    const [sMin, sMax] = asq3Ranges[riskLevel];
    const asq3Score = isROP ? 0 : sMin + Math.floor(rng() * (sMax - sMin + 1));
    const asq3Percentile = isROP ? 0
      : riskLevel === "on_track"
        ? 50 + Math.floor(rng() * 45)
        : riskLevel === "monitor"
        ? 15 + Math.floor(rng() * 35)
        : riskLevel === "urgent"
        ? 3 + Math.floor(rng() * 15)
        : 1 + Math.floor(rng() * 5);

    const icd10Pool = ICD10_BY_DOMAIN[primaryDomain] || ICD10_BY_DOMAIN["comprehensive"];
    const icd10Count = riskLevel === "on_track" ? 0 : 1 + Math.floor(rng() * Math.min(3, icd10Pool.length));
    const icd10Codes =
      riskLevel === "on_track"
        ? ["Z00.129"]
        : [...icd10Pool].sort(() => rng() - 0.5).slice(0, icd10Count);

    const recPool =
      RECOMMENDATIONS_BY_RISK[severity] || RECOMMENDATIONS_BY_RISK["on_track"];
    const recCount = 2 + Math.floor(rng() * 3);
    const recommendations = [...recPool]
      .sort(() => rng() - 0.5)
      .slice(0, recCount)
      .map((r) => ({
        action: r[0],
        timeline: r[1] as ScenarioRecommendation["timeline"],
        priority: r[2] as ScenarioRecommendation["priority"],
        evidence_level: r[3] as ScenarioRecommendation["evidence_level"],
      }));

    const isPreemie = isROP || (childAge <= 12 && rng() > 0.75);
    const gestationalAgeWeeks = isPreemie ? 24 + Math.floor(rng() * 13) : undefined;
    const correctedAge = gestationalAgeWeeks
      ? Math.max(0, childAge - Math.round((40 - gestationalAgeWeeks) / 4.3))
      : undefined;

    const timestamp = new Date(now - Math.floor(rng() * twoYears)).toISOString();
    const inferenceTimeMs = 800 + Math.floor(rng() * 2800);

    const observation = isROP
      ? generateROPObservation(riskLevel, gestationalAgeWeeks || 28, rng)
      : getObservation(primaryDomain, ageBand, severity, rng);
    const chwNotes = generateCHWNotes(primaryDomain, riskLevel, setting, rng);
    const keyFindings = generateKeyFindings(primaryDomain, riskLevel, childAge, rng);
    const clinicalSummary = generateClinicalSummary(
      profile.name,
      childAge,
      primaryDomain,
      riskLevel,
      rng
    );
    const domainBreakdown = generateDomainBreakdown(primaryDomain, riskLevel, rng);
    const parentReport = generateParentReport(primaryDomain, riskLevel, childAge, rng);
    const etropClassification = isROP ? generateETROP(riskLevel, rng) : undefined;
    const mchat = generateMCHATR(primaryDomain, riskLevel, childAge, rng);

    scenarios.push({
      id: `scenario-${String(i + 1).padStart(4, "0")}`,
      childName: profile.name,
      childAge,
      childSex: profile.sex,
      childLanguage: profile.language,
      childRegion: profile.region,
      domain,
      primaryDomain,
      setting,
      chwName,
      clinicLocation: location,
      observations: observation,
      chwNotes,
      riskLevel,
      confidence,
      asq3Score,
      asq3Percentile,
      asq3CutoffFlag: riskLevel !== "on_track",
      icd10Codes,
      keyFindings,
      clinicalSummary,
      recommendations,
      domainBreakdown,
      gestationalAgeWeeks,
      correctedAge,
      parentReport,
      mchatRScore: mchat.score,
      mchatRFlag: mchat.flag,
      etropClassification,
      timestamp,
      modelVersion: "MedGemma-2B-IT-Q4 v1.2.0",
      inferenceTimeMs,
    });
  }

  return scenarios;
}

export function getScenariosByRisk(
  scenarios: ScreeningScenario[],
  risk: ScenarioRisk
): ScreeningScenario[] {
  return scenarios.filter((s) => s.riskLevel === risk);
}

export function getScenariosByDomain(
  scenarios: ScreeningScenario[],
  domain: ScenarioDomain
): ScreeningScenario[] {
  return scenarios.filter((s) => s.domain === domain);
}

export function getScenariosByAgeRange(
  scenarios: ScreeningScenario[],
  minAge: number,
  maxAge: number
): ScreeningScenario[] {
  return scenarios.filter((s) => s.childAge >= minAge && s.childAge <= maxAge);
}

export function getScenarioStats(scenarios: ScreeningScenario[]) {
  const total = scenarios.length;
  const byRisk = {
    on_track: scenarios.filter((s) => s.riskLevel === "on_track").length,
    monitor: scenarios.filter((s) => s.riskLevel === "monitor").length,
    urgent: scenarios.filter((s) => s.riskLevel === "urgent").length,
    referral: scenarios.filter((s) => s.riskLevel === "referral").length,
  };
  const byDomain = ALL_DOMAINS.reduce(
    (acc, d) => {
      acc[d] = scenarios.filter((s) => s.domain === d).length;
      return acc;
    },
    {} as Record<string, number>
  );
  const avgConfidence = scenarios.reduce((s, sc) => s + sc.confidence, 0) / total;
  const avgInferenceTime = scenarios.reduce((s, sc) => s + sc.inferenceTimeMs, 0) / total;
  const preemieCount = scenarios.filter((s) => s.gestationalAgeWeeks !== undefined).length;
  const avgASQ3 = scenarios.reduce((s, sc) => s + sc.asq3Score, 0) / total;

  const uniqueChildren = new Set(scenarios.map((s) => s.childName)).size;
  const uniqueCHWs = new Set(scenarios.map((s) => s.chwName)).size;

  const ageDistribution = {
    newborn: scenarios.filter((s) => s.childAge <= 3).length,
    infant: scenarios.filter((s) => s.childAge > 3 && s.childAge <= 12).length,
    toddler: scenarios.filter((s) => s.childAge > 12 && s.childAge <= 36).length,
    preschool: scenarios.filter((s) => s.childAge > 36).length,
  };

  const ropCount = scenarios.filter((s) => s.domain === "rop_screening").length;
  const mchatRCount = scenarios.filter((s) => s.mchatRScore !== undefined).length;
  const parentReportCount = scenarios.filter((s) => s.parentReport !== undefined).length;
  const correctedAgeCount = scenarios.filter((s) => s.correctedAge !== undefined).length;

  return {
    total,
    byRisk,
    byDomain,
    avgConfidence: parseFloat(avgConfidence.toFixed(3)),
    avgInferenceTime: Math.round(avgInferenceTime),
    preemieCount,
    avgASQ3: parseFloat(avgASQ3.toFixed(1)),
    uniqueChildren,
    uniqueCHWs,
    ageDistribution,
    ropCount,
    mchatRCount,
    parentReportCount,
    correctedAgeCount,
  };
}

let _cachedDataset: ScreeningScenario[] | null = null;

export function getScreeningDataset(): ScreeningScenario[] {
  if (!_cachedDataset) {
    _cachedDataset = generateScreeningDataset(2500);
  }
  return _cachedDataset;
}

export function getRecentScreenings(count: number = 10): ScreeningScenario[] {
  const dataset = getScreeningDataset();
  return [...dataset]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, count);
}

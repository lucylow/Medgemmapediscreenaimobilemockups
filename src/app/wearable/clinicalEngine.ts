import type { WearableMetrics, WearableRisk, WearableSummary, FHIRObservation } from "./types";

const AGE_THRESHOLDS: Record<string, Record<string, number>> = {
  steps: {
    "0-11": 300,
    "12-17": 800,
    "18-35": 1500,
    "36-60": 2500,
  },
  sleep: {
    "0-11": 12,
    "12-17": 11,
    "18-35": 10,
    "36-60": 10,
  },
  falls: {
    "0-11": 5,
    "12-17": 3,
    "18-35": 2,
    "36-60": 1.5,
  },
};

function getAgeGroup(ageMonths: number): string {
  if (ageMonths < 12) return "0-11";
  if (ageMonths < 18) return "12-17";
  if (ageMonths < 36) return "18-35";
  return "36-60";
}

export function computeWearableRisks(metrics: WearableMetrics): WearableRisk[] {
  const risks: WearableRisk[] = [];
  const ag = getAgeGroup(metrics.ageMonths);

  if (metrics.hrvRmssd < 15) {
    risks.push({
      domain: "autonomic",
      riskLevel: "high",
      percentile: 5,
      confidence: 0.92,
      icd10Codes: ["R45.6", "G90.9"],
      finding: `HRV RMSSD ${metrics.hrvRmssd.toFixed(0)}ms — below 15ms threshold indicates autonomic stress`,
      recommendation: "Refer to developmental pediatrician for autonomic maturity assessment; consider cortisol panel",
    });
  } else if (metrics.hrvRmssd < 25) {
    risks.push({
      domain: "autonomic",
      riskLevel: "medium",
      percentile: 20,
      confidence: 0.85,
      icd10Codes: ["R45.6"],
      finding: `HRV RMSSD ${metrics.hrvRmssd.toFixed(0)}ms — borderline autonomic regulation`,
      recommendation: "Monitor HRV trends over 30 days; consider stress reduction strategies",
    });
  }

  const stepsThreshold = AGE_THRESHOLDS.steps[ag] || 1500;
  if (metrics.stepsPerDay < stepsThreshold * 0.5) {
    risks.push({
      domain: "motor",
      riskLevel: "high",
      percentile: 8,
      confidence: 0.88,
      icd10Codes: ["R62.0", "F82"],
      finding: `${metrics.stepsPerDay.toFixed(0)} steps/day — significantly below ${stepsThreshold} threshold for age`,
      recommendation: "PT referral for gross motor evaluation; age-appropriate activity program",
    });
  } else if (metrics.stepsPerDay < stepsThreshold) {
    risks.push({
      domain: "motor",
      riskLevel: "medium",
      percentile: 18,
      confidence: 0.82,
      icd10Codes: ["R62.0"],
      finding: `${metrics.stepsPerDay.toFixed(0)} steps/day — below expected ${stepsThreshold} for age`,
      recommendation: "Structured outdoor play 30min/day; reassess in 2 weeks",
    });
  }

  const sleepThreshold = AGE_THRESHOLDS.sleep[ag] || 10;
  if (metrics.sleepHours < sleepThreshold - 2) {
    risks.push({
      domain: "cognitive",
      riskLevel: "high",
      percentile: 6,
      confidence: 0.87,
      icd10Codes: ["F51.9", "G47.9"],
      finding: `${metrics.sleepHours.toFixed(1)}h sleep — significantly below ${sleepThreshold}h minimum for age`,
      recommendation: "Sleep hygiene intervention; evaluate for sleep disorders; language screening",
    });
  } else if (metrics.sleepHours < sleepThreshold) {
    risks.push({
      domain: "cognitive",
      riskLevel: "medium",
      percentile: 15,
      confidence: 0.85,
      icd10Codes: ["F51.9"],
      finding: `${metrics.sleepHours.toFixed(1)}h sleep — suboptimal for developmental needs`,
      recommendation: "Consistent bedtime routine; limit screen time before sleep",
    });
  }

  const spo2Threshold = metrics.ageMonths < 12 ? 93 : 95;
  if (metrics.spo2Average < 92) {
    risks.push({
      domain: "language",
      riskLevel: "high",
      percentile: 3,
      confidence: 0.89,
      icd10Codes: ["R09.02", "F80.9"],
      finding: `SpO2 ${metrics.spo2Average.toFixed(1)}% — chronic hypoxemia impacts language/cognitive development`,
      recommendation: "Urgent pulmonology referral; speech-language screening; continuous SpO2 monitoring",
    });
  } else if (metrics.spo2Average < spo2Threshold) {
    risks.push({
      domain: "language",
      riskLevel: "medium",
      percentile: 12,
      confidence: 0.82,
      icd10Codes: ["R09.02"],
      finding: `SpO2 ${metrics.spo2Average.toFixed(1)}% — borderline; may affect language milestones`,
      recommendation: "Monitor SpO2 trends; speech screening if persistent; evaluate during sleep",
    });
  }

  const fallsThreshold = AGE_THRESHOLDS.falls[ag] || 2;
  if (metrics.fallEventsPerHour > fallsThreshold * 1.5) {
    risks.push({
      domain: "balance",
      riskLevel: "high",
      percentile: 7,
      confidence: 0.90,
      icd10Codes: ["R26.2", "R27.0"],
      finding: `${metrics.fallEventsPerHour.toFixed(1)} falls/hr — exceeds ${fallsThreshold}/hr threshold for age`,
      recommendation: "PT evaluation for balance and vestibular function; fall risk mitigation",
    });
  } else if (metrics.fallEventsPerHour > fallsThreshold) {
    risks.push({
      domain: "balance",
      riskLevel: "medium",
      percentile: 20,
      confidence: 0.83,
      icd10Codes: ["R26.2"],
      finding: `${metrics.fallEventsPerHour.toFixed(1)} falls/hr — above expected for age`,
      recommendation: "Structured balance activities; reassess vestibular function in 4 weeks",
    });
  }

  return risks;
}

export function generateWearableSummary(metrics: WearableMetrics): WearableSummary {
  const risks = computeWearableRisks(metrics);
  const highCount = risks.filter((r) => r.riskLevel === "high").length;
  const medCount = risks.filter((r) => r.riskLevel === "medium").length;

  const overallRisk: "low" | "medium" | "high" =
    highCount > 0 ? "high" : medCount >= 2 ? "high" : medCount > 0 ? "medium" : "low";

  const wearableScore = Math.max(0, 100 - highCount * 25 - medCount * 12);

  const keyFindings = [
    `HRV ${metrics.hrvRmssd.toFixed(0)}ms RMSSD ${metrics.hrvRmssd < 15 ? "(stress flag)" : metrics.hrvRmssd < 25 ? "(borderline)" : "(normal)"}`,
    `${metrics.stepsPerDay.toFixed(0)} steps/day`,
    `${metrics.sleepHours.toFixed(1)}h sleep/night`,
    `SpO2 ${metrics.spo2Average.toFixed(1)}%`,
    `${metrics.fallEventsPerHour.toFixed(1)} falls/hr`,
  ];

  const recommendations: string[] = [];
  if (risks.length === 0) {
    recommendations.push("All wearable metrics within normal range");
    recommendations.push("Continue routine developmental screening at next visit");
  } else {
    risks.forEach((r) => recommendations.push(r.recommendation));
  }
  recommendations.push("Review full 30-day wearable trends for longitudinal patterns");

  const fhirObservations = metricsToFHIR(metrics);

  return { overallRisk, wearableScore, keyFindings, recommendations, risks, fhirObservations };
}

function metricsToFHIR(metrics: WearableMetrics): FHIRObservation[] {
  const now = new Date().toISOString();
  return [
    {
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "80404-7", display: "Heart rate variability RMSSD" }] },
      valueQuantity: { value: metrics.hrvRmssd, unit: "ms", system: "http://unitsofmeasure.org", code: "ms" },
      effectiveDateTime: now,
      interpretation: metrics.hrvRmssd < 15 ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "L", display: "Low" }] }] : undefined,
    },
    {
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "55423-8", display: "Step count" }] },
      valueQuantity: { value: metrics.stepsPerDay, unit: "steps/d", system: "http://unitsofmeasure.org", code: "{steps}/d" },
      effectiveDateTime: now,
    },
    {
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "93832-4", display: "Sleep duration" }] },
      valueQuantity: { value: metrics.sleepHours, unit: "h", system: "http://unitsofmeasure.org", code: "h" },
      effectiveDateTime: now,
    },
    {
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation" }] },
      valueQuantity: { value: metrics.spo2Average, unit: "%", system: "http://unitsofmeasure.org", code: "%" },
      effectiveDateTime: now,
      interpretation: metrics.spo2Average < 92 ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "L", display: "Low" }] }] : undefined,
    },
    {
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "52488-0", display: "Fall frequency" }] },
      valueQuantity: { value: metrics.fallEventsPerHour, unit: "/h", system: "http://unitsofmeasure.org", code: "{events}/h" },
      effectiveDateTime: now,
    },
  ];
}

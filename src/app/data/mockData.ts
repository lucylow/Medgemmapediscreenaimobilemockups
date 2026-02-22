import { getScreeningDataset, getScenarioStats, getRecentScreenings } from "../../mock-data/screening-scenarios";
import type { ScreeningScenario } from "../../mock-data/screening-scenarios";

export type RiskLevel = "REFERRAL" | "URGENT" | "MONITOR" | "ON-TRACK";

export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: "M" | "F";
  risk: RiskLevel;
  condition: string;
  confidence: number;
  domain: string;
  asqScore?: string;
  zScore?: number;
  gestationalAge?: string;
  timestamp: string;
  chwName?: string;
  setting?: string;
}

function mapRisk(r: ScreeningScenario["riskLevel"]): RiskLevel {
  const m: Record<string, RiskLevel> = {
    on_track: "ON-TRACK",
    monitor: "MONITOR",
    urgent: "URGENT",
    referral: "REFERRAL",
  };
  return m[r] || "MONITOR";
}

function domainLabel(d: string): string {
  const labels: Record<string, string> = {
    communication: "Communication",
    gross_motor: "Gross Motor",
    fine_motor: "Fine Motor",
    problem_solving: "Problem Solving",
    personal_social: "Personal-Social",
    rop_screening: "ROP Screening",
    comprehensive: "Comprehensive",
  };
  return labels[d] || d;
}

function buildPatient(s: ScreeningScenario): Patient {
  return {
    id: s.id,
    name: s.childName,
    age: s.childAge < 12 ? `${s.childAge}mo` : `${s.childAge}mo`,
    gender: s.childSex === "male" ? "M" : "F",
    risk: mapRisk(s.riskLevel),
    condition: s.clinicalSummary.slice(0, 80) + "...",
    confidence: parseFloat((s.confidence * 100).toFixed(1)),
    domain: domainLabel(s.domain),
    asqScore: `${s.asq3Score}/60 (${s.asq3Percentile}th %ile)`,
    zScore: s.riskLevel === "on_track" ? undefined : parseFloat((-1 - (s.confidence * 2)).toFixed(1)),
    gestationalAge: s.gestationalAgeWeeks ? `${s.gestationalAgeWeeks}w` : undefined,
    timestamp: s.timestamp,
    chwName: s.chwName,
    setting: s.setting,
  };
}

const _dataset = getScreeningDataset();
const _stats = getScenarioStats(_dataset);

export const mockPatients: Patient[] = getRecentScreenings(20).map(buildPatient);

export const allMockPatients: Patient[] = _dataset.map(buildPatient);

export const riskCounts = {
  REFERRAL: _stats.byRisk.referral,
  URGENT: _stats.byRisk.urgent,
  MONITOR: _stats.byRisk.monitor,
  "ON-TRACK": _stats.byRisk.on_track,
};

export const domainCounts = Object.entries(_stats.byDomain).map(([domain, count]) => ({
  domain: domainLabel(domain),
  count,
}));

export const chwLeaderboard = [
  { name: "Maria Santos", screenings: 247, savings: 2.3, region: "Latin America" },
  { name: "Carlos Mendoza", screenings: 189, savings: 1.8, region: "Latin America" },
  { name: "Aisha Bello", screenings: 176, savings: 1.6, region: "West Africa" },
  { name: "Raj Patel", screenings: 158, savings: 1.4, region: "South Asia" },
  { name: "Sofia Chen", screenings: 142, savings: 1.2, region: "East Asia" },
  { name: "Omar Hassan", screenings: 134, savings: 1.1, region: "MENA" },
  { name: "Grace Okafor", screenings: 128, savings: 1.0, region: "West Africa" },
  { name: "Luis Rivera", screenings: 115, savings: 0.9, region: "Latin America" },
  { name: "Fatima Al-Rashid", screenings: 102, savings: 0.8, region: "MENA" },
  { name: "James Kimathi", screenings: 97, savings: 0.7, region: "East Africa" },
];

export const impactMetrics = {
  lifetimeSavings: 15.9,
  childrenScreened: _stats.total,
  earlyDetectionRate: Math.round(
    ((_stats.byRisk.urgent + _stats.byRisk.referral) / _stats.total) * 100
  ),
  totalCHWs: _stats.uniqueCHWs,
  avgConfidence: _stats.avgConfidence,
  avgInferenceTime: _stats.avgInferenceTime,
  avgASQ3: _stats.avgASQ3,
  preemieCount: _stats.preemieCount,
  ageDistribution: _stats.ageDistribution,
};

export const growthData = [
  { month: "Jan", height: 15, weight: 25, boneAge: -1.8 },
  { month: "Feb", height: 16, weight: 26, boneAge: -1.9 },
  { month: "Mar", height: 17, weight: 27, boneAge: -2.0 },
  { month: "Apr", height: 18, weight: 28, boneAge: -2.1 },
  { month: "May", height: 19, weight: 29, boneAge: -2.0 },
  { month: "Jun", height: 20, weight: 30, boneAge: -1.9 },
];

export const milestones = [
  { text: "Looks when name called (9mo)", achieved: true },
  { text: "Points to show interest (12mo)", achieved: true },
  { text: "Uses 2-word combinations (24mo)", achieved: false },
  { text: "Follows 2-step commands (24mo)", achieved: false },
];

export { getScreeningDataset, getRecentScreenings, getScenarioStats } from "../../mock-data/screening-scenarios";
export type { ScreeningScenario } from "../../mock-data/screening-scenarios";

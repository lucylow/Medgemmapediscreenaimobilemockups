export type RiskLevel = "REFERRAL" | "URGENT" | "MONITOR" | "ON-TRACK";

export interface Patient {
  id: string;
  age: string;
  gender: "M" | "F";
  risk: RiskLevel;
  condition: string;
  confidence: number;
  asqScore?: string;
  zScore?: number;
  gestationalAge?: string;
  timestamp: string;
}

export const mockPatients: Patient[] = [
  {
    id: "CHW-001",
    age: "24mo",
    gender: "F",
    risk: "REFERRAL",
    condition: "Speech regression + no 50 words",
    confidence: 97.3,
    asqScore: "18/60 (3rd %ile)",
    zScore: -2.3,
    timestamp: "2026-02-21T09:15:00",
  },
  {
    id: "CHW-023",
    age: "32w GA",
    gender: "M",
    risk: "URGENT",
    condition: "ROP Zone II Stage 2",
    confidence: 94.8,
    gestationalAge: "32w",
    timestamp: "2026-02-21T08:45:00",
  },
  {
    id: "CHW-045",
    age: "18mo",
    gender: "F",
    risk: "URGENT",
    condition: "No joint attention",
    confidence: 91.2,
    asqScore: "22/60 (8th %ile)",
    timestamp: "2026-02-21T08:30:00",
  },
  {
    id: "CHW-067",
    age: "12mo",
    gender: "M",
    risk: "MONITOR",
    condition: "Delayed walking",
    confidence: 85.6,
    asqScore: "38/60 (25th %ile)",
    timestamp: "2026-02-21T07:20:00",
  },
  {
    id: "CHW-089",
    age: "36mo",
    gender: "F",
    risk: "MONITOR",
    condition: "Fine motor delay",
    confidence: 82.4,
    timestamp: "2026-02-21T07:00:00",
  },
  {
    id: "CHW-012",
    age: "48mo",
    gender: "M",
    risk: "ON-TRACK",
    condition: "All milestones achieved",
    confidence: 96.7,
    asqScore: "54/60 (75th %ile)",
    timestamp: "2026-02-20T16:30:00",
  },
];

export const riskCounts = {
  REFERRAL: 2,
  URGENT: 8,
  MONITOR: 23,
  "ON-TRACK": 14,
};

export const chwLeaderboard = [
  { name: "Maria", screenings: 247, savings: 2.3 },
  { name: "Carlos", screenings: 189, savings: 1.8 },
  { name: "Aisha", screenings: 176, savings: 1.6 },
  { name: "Raj", screenings: 158, savings: 1.4 },
  { name: "Sofia", screenings: 142, savings: 1.2 },
];

export const impactMetrics = {
  lifetimeSavings: 15.9,
  childrenScreened: 1592,
  earlyDetectionRate: 32,
  totalCHWs: 47,
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

export interface WearableMetrics {
  hrvRmssd: number;
  stepsPerDay: number;
  sleepHours: number;
  spo2Average: number;
  fallEventsPerHour: number;
  ageMonths: number;
  timestamp: string;
}

export interface WearableTrendPoint {
  date: string;
  hrvRmssd: number;
  stepsPerDay: number;
  sleepHours: number;
  spo2Average: number;
  fallEventsPerHour: number;
}

export interface WearableRisk {
  domain: "motor" | "autonomic" | "cognitive" | "language" | "balance";
  riskLevel: "low" | "medium" | "high";
  percentile: number;
  confidence: number;
  icd10Codes: string[];
  finding: string;
  recommendation: string;
}

export interface WearableSummary {
  overallRisk: "low" | "medium" | "high";
  wearableScore: number;
  keyFindings: string[];
  recommendations: string[];
  risks: WearableRisk[];
  fhirObservations: FHIRObservation[];
}

export interface FHIRObservation {
  resourceType: "Observation";
  status: "final";
  code: {
    coding: { system: string; code: string; display: string }[];
  };
  valueQuantity: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  effectiveDateTime: string;
  interpretation?: {
    coding: { system: string; code: string; display: string }[];
  }[];
}

export type WearableConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface WearableDevice {
  id: string;
  name: string;
  type: "smartwatch" | "fitness_band" | "pulse_oximeter" | "baby_monitor";
  battery?: number;
  lastSync?: string;
}

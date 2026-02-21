export interface GrowthMeasurement {
  id: string;
  childId: string;
  date: string;
  ageMonths: number;
  weight?: number;
  height?: number;
  headCircumference?: number;
}

export interface ZScoreResult {
  zscore: number;
  percentile: number;
  classification: "normal" | "monitor" | "concern" | "severe";
}

interface LMSEntry {
  age: number;
  L: number;
  M: number;
  S: number;
}

const WHO_WEIGHT_BOYS: LMSEntry[] = [
  { age: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { age: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { age: 2, L: 0.197, M: 5.5675, S: 0.12385 },
  { age: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { age: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
  { age: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
  { age: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  { age: 9, L: 0.0956, M: 8.9014, S: 0.10873 },
  { age: 12, L: 0.0693, M: 9.6479, S: 0.11041 },
  { age: 15, L: 0.0427, M: 10.306, S: 0.11296 },
  { age: 18, L: 0.0168, M: 10.9, S: 0.11565 },
  { age: 21, L: -0.0083, M: 11.4753, S: 0.11835 },
  { age: 24, L: -0.0327, M: 12.0424, S: 0.12096 },
  { age: 30, L: -0.0746, M: 13.0669, S: 0.1256 },
  { age: 36, L: -0.1085, M: 14.0054, S: 0.12945 },
  { age: 42, L: -0.137, M: 14.916, S: 0.13248 },
  { age: 48, L: -0.1646, M: 15.8568, S: 0.13437 },
  { age: 54, L: -0.1941, M: 16.8514, S: 0.13517 },
  { age: 60, L: -0.226, M: 17.916, S: 0.13489 },
];

const WHO_WEIGHT_GIRLS: LMSEntry[] = [
  { age: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { age: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { age: 2, L: 0.0962, M: 5.1282, S: 0.12993 },
  { age: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
  { age: 4, L: -0.005, M: 6.4237, S: 0.12402 },
  { age: 5, L: -0.043, M: 6.8985, S: 0.12274 },
  { age: 6, L: -0.0756, M: 7.297, S: 0.12204 },
  { age: 9, L: -0.1416, M: 8.2, S: 0.12157 },
  { age: 12, L: -0.1926, M: 8.9481, S: 0.12268 },
  { age: 15, L: -0.2374, M: 9.6285, S: 0.12483 },
  { age: 18, L: -0.2773, M: 10.2904, S: 0.12773 },
  { age: 21, L: -0.314, M: 10.959, S: 0.13111 },
  { age: 24, L: -0.3476, M: 11.642, S: 0.1348 },
  { age: 30, L: -0.4064, M: 12.9515, S: 0.14259 },
  { age: 36, L: -0.453, M: 14.184, S: 0.14898 },
  { age: 42, L: -0.4883, M: 15.3955, S: 0.15392 },
  { age: 48, L: -0.5125, M: 16.6266, S: 0.15735 },
  { age: 54, L: -0.5271, M: 17.8753, S: 0.1594 },
  { age: 60, L: -0.5344, M: 19.154, S: 0.16023 },
];

const WHO_HEIGHT_BOYS: LMSEntry[] = [
  { age: 0, L: 1, M: 49.8842, S: 0.03795 },
  { age: 1, L: 1, M: 54.7244, S: 0.03557 },
  { age: 2, L: 1, M: 58.4249, S: 0.03424 },
  { age: 3, L: 1, M: 61.4292, S: 0.03328 },
  { age: 4, L: 1, M: 63.886, S: 0.03257 },
  { age: 5, L: 1, M: 65.9026, S: 0.03204 },
  { age: 6, L: 1, M: 67.6236, S: 0.03165 },
  { age: 9, L: 1, M: 72.0866, S: 0.03072 },
  { age: 12, L: 1, M: 75.7488, S: 0.0301 },
  { age: 15, L: 1, M: 79.2618, S: 0.02975 },
  { age: 18, L: 1, M: 82.4529, S: 0.02955 },
  { age: 21, L: 1, M: 85.1901, S: 0.02949 },
  { age: 24, L: 1, M: 87.8161, S: 0.02957 },
  { age: 30, L: 1, M: 92.356, S: 0.02978 },
  { age: 36, L: 1, M: 96.483, S: 0.03017 },
  { age: 42, L: 1, M: 100.343, S: 0.03056 },
  { age: 48, L: 1, M: 103.9967, S: 0.03095 },
  { age: 54, L: 1, M: 107.5014, S: 0.03132 },
  { age: 60, L: 1, M: 110.8711, S: 0.03169 },
];

const WHO_HEIGHT_GIRLS: LMSEntry[] = [
  { age: 0, L: 1, M: 49.1477, S: 0.0379 },
  { age: 1, L: 1, M: 53.6872, S: 0.0364 },
  { age: 2, L: 1, M: 57.0673, S: 0.03568 },
  { age: 3, L: 1, M: 59.8029, S: 0.0352 },
  { age: 4, L: 1, M: 62.0899, S: 0.03486 },
  { age: 5, L: 1, M: 64.0301, S: 0.03463 },
  { age: 6, L: 1, M: 65.7311, S: 0.03448 },
  { age: 9, L: 1, M: 70.1435, S: 0.03396 },
  { age: 12, L: 1, M: 73.858, S: 0.03382 },
  { age: 15, L: 1, M: 77.5411, S: 0.03374 },
  { age: 18, L: 1, M: 80.7153, S: 0.03393 },
  { age: 21, L: 1, M: 83.6318, S: 0.03422 },
  { age: 24, L: 1, M: 86.3604, S: 0.0346 },
  { age: 30, L: 1, M: 91.2959, S: 0.03555 },
  { age: 36, L: 1, M: 95.715, S: 0.03655 },
  { age: 42, L: 1, M: 99.826, S: 0.03745 },
  { age: 48, L: 1, M: 103.7025, S: 0.03825 },
  { age: 54, L: 1, M: 107.3878, S: 0.03893 },
  { age: 60, L: 1, M: 110.876, S: 0.03949 },
];

const WHO_HC_BOYS: LMSEntry[] = [
  { age: 0, L: 1, M: 34.4618, S: 0.03686 },
  { age: 1, L: 1, M: 37.2759, S: 0.03133 },
  { age: 2, L: 1, M: 39.1285, S: 0.02997 },
  { age: 3, L: 1, M: 40.5135, S: 0.02918 },
  { age: 4, L: 1, M: 41.6317, S: 0.02868 },
  { age: 5, L: 1, M: 42.5576, S: 0.02837 },
  { age: 6, L: 1, M: 43.3306, S: 0.02817 },
  { age: 9, L: 1, M: 45.1986, S: 0.02762 },
  { age: 12, L: 1, M: 46.4857, S: 0.02731 },
  { age: 18, L: 1, M: 48.0689, S: 0.02694 },
  { age: 24, L: 1, M: 49.0211, S: 0.02672 },
  { age: 36, L: 1, M: 50.2313, S: 0.02651 },
  { age: 48, L: 1, M: 51.0253, S: 0.02636 },
  { age: 60, L: 1, M: 51.6122, S: 0.02624 },
];

const WHO_HC_GIRLS: LMSEntry[] = [
  { age: 0, L: 1, M: 33.8787, S: 0.03496 },
  { age: 1, L: 1, M: 36.5463, S: 0.03155 },
  { age: 2, L: 1, M: 38.2521, S: 0.03033 },
  { age: 3, L: 1, M: 39.5282, S: 0.02966 },
  { age: 4, L: 1, M: 40.5817, S: 0.02925 },
  { age: 5, L: 1, M: 41.459, S: 0.02899 },
  { age: 6, L: 1, M: 42.1995, S: 0.02884 },
  { age: 9, L: 1, M: 43.9965, S: 0.02849 },
  { age: 12, L: 1, M: 45.2325, S: 0.02831 },
  { age: 18, L: 1, M: 46.7495, S: 0.02806 },
  { age: 24, L: 1, M: 47.6942, S: 0.02791 },
  { age: 36, L: 1, M: 48.8857, S: 0.02776 },
  { age: 48, L: 1, M: 49.6627, S: 0.02766 },
  { age: 60, L: 1, M: 50.2338, S: 0.02759 },
];

function interpolateLMS(table: LMSEntry[], ageMonths: number): LMSEntry {
  if (ageMonths <= table[0].age) return table[0];
  if (ageMonths >= table[table.length - 1].age) return table[table.length - 1];
  let lower = table[0], upper = table[1];
  for (let i = 0; i < table.length - 1; i++) {
    if (table[i].age <= ageMonths && table[i + 1].age >= ageMonths) {
      lower = table[i];
      upper = table[i + 1];
      break;
    }
  }
  const frac = (ageMonths - lower.age) / (upper.age - lower.age || 1);
  return {
    age: ageMonths,
    L: lower.L + frac * (upper.L - lower.L),
    M: lower.M + frac * (upper.M - lower.M),
    S: lower.S + frac * (upper.S - lower.S),
  };
}

function computeZScore(measurement: number, lms: LMSEntry): number {
  const { L, M, S } = lms;
  if (L === 0) return Math.log(measurement / M) / S;
  return (Math.pow(measurement / M, L) - 1) / (L * S);
}

function zscoreToPercentile(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327;
  const p = d * Math.exp(-z * z / 2) * (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  return Math.round((z > 0 ? (1 - p) : p) * 1000) / 10;
}

function classify(z: number): ZScoreResult["classification"] {
  const absZ = Math.abs(z);
  if (absZ < 1) return "normal";
  if (absZ < 2) return "monitor";
  if (absZ < 3) return "concern";
  return "severe";
}

type Sex = "male" | "female";
type MeasureType = "weight" | "height" | "headCircumference";

function getTable(sex: Sex, type: MeasureType): LMSEntry[] {
  if (type === "weight") return sex === "male" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
  if (type === "height") return sex === "male" ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
  return sex === "male" ? WHO_HC_BOYS : WHO_HC_GIRLS;
}

export function calculateZScore(
  measurement: number,
  ageMonths: number,
  sex: Sex,
  type: MeasureType
): ZScoreResult {
  const table = getTable(sex, type);
  const lms = interpolateLMS(table, ageMonths);
  const z = computeZScore(measurement, lms);
  const clampedZ = Math.max(-4, Math.min(4, z));
  return {
    zscore: Math.round(clampedZ * 100) / 100,
    percentile: zscoreToPercentile(clampedZ),
    classification: classify(clampedZ),
  };
}

export function getMedianForAge(ageMonths: number, sex: Sex, type: MeasureType): number {
  const table = getTable(sex, type);
  return interpolateLMS(table, ageMonths).M;
}

export function getPercentileCurve(
  sex: Sex,
  type: MeasureType,
  percentiles: number[] = [-2, -1, 0, 1, 2]
): { age: number; values: Record<string, number> }[] {
  const table = getTable(sex, type);
  return table.map((entry) => {
    const values: Record<string, number> = {};
    percentiles.forEach((z) => {
      const label = z === 0 ? "median" : z < 0 ? `minus${Math.abs(z)}sd` : `plus${z}sd`;
      if (entry.L === 0) {
        values[label] = Math.round(entry.M * Math.exp(entry.S * z) * 10) / 10;
      } else {
        values[label] = Math.round(entry.M * Math.pow(1 + entry.L * entry.S * z, 1 / entry.L) * 10) / 10;
      }
    });
    return { age: entry.age, values };
  });
}

const GROWTH_STORAGE_KEY = "pediscreen_growth_measurements";

export function getGrowthMeasurements(childId?: string): GrowthMeasurement[] {
  try {
    const raw = localStorage.getItem(GROWTH_STORAGE_KEY);
    const all: GrowthMeasurement[] = raw ? JSON.parse(raw) : [];
    return childId ? all.filter((m) => m.childId === childId) : all;
  } catch {
    return [];
  }
}

export function saveGrowthMeasurement(measurement: GrowthMeasurement): void {
  const all = getGrowthMeasurements();
  const idx = all.findIndex((m) => m.id === measurement.id);
  if (idx >= 0) all[idx] = measurement;
  else all.push(measurement);
  localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(all));
}

export function deleteGrowthMeasurement(id: string): void {
  const all = getGrowthMeasurements().filter((m) => m.id !== id);
  localStorage.setItem(GROWTH_STORAGE_KEY, JSON.stringify(all));
}

export const CLASSIFICATION_COLORS: Record<ZScoreResult["classification"], string> = {
  normal: "#34A853",
  monitor: "#FBBC05",
  concern: "#FF9800",
  severe: "#EA4335",
};

export const CLASSIFICATION_LABELS: Record<ZScoreResult["classification"], string> = {
  normal: "Normal",
  monitor: "Monitor",
  concern: "Below/Above Normal",
  severe: "Significantly Abnormal",
};
